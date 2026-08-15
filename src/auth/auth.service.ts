import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: 'USER',
                emailVerificationToken: verificationToken,
                emailVerificationExpires: expiresAt,
            }
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        
        await this.emailService.sendVerificationEmail(user.email, verificationLink);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(
            dto.email,
        );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email address first.');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: await this.jwtService.signAsync(
                payload,
            ),
        };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.oldPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid old password');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.usersService.updatePassword(userId, hashedPassword);
        
        await this.emailService.sendPasswordChangeNotification(user.email);

        return {
            message: 'Password changed successfully',
        };
    }

    async requestEmailChange(userId: string, dto: RequestEmailChangeDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.newEmail },
                    { pendingEmail: dto.newEmail }
                ]
            }
        });

        if (existingUser && existingUser.id !== userId) {
            throw new ConflictException('Email already in use');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                pendingEmail: dto.newEmail,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: expiresAt,
            },
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        
        await this.emailService.sendVerificationEmail(dto.newEmail, verificationLink);

        return {
            message: 'Verification link sent to your new email. Please check your inbox.',
        };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                businessProfile: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            hasProfile: !!user.profile,
            hasBusinessProfile: !!user.businessProfile,
        };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findUnique({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid verification token');
        }

        if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
            throw new UnauthorizedException('Verification token has expired');
        }

        const data: any = {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        };

        if (user.pendingEmail) {
            data.email = user.pendingEmail;
            data.pendingEmail = null;
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data,
        });

        return { message: 'Email successfully verified. You can now login.' };
    }

    async resendVerification(email: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            // Do not reveal if user exists or not for security
            return { message: 'If the email is registered, a new verification link will be sent.' };
        }

        if (user.isEmailVerified) {
            return { message: 'Email is already verified.' };
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken,
                emailVerificationExpires: expiresAt,
            },
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        
        await this.emailService.sendVerificationEmail(user.email, verificationLink);

        return { message: 'If the email is registered, a new verification link will be sent.' };
    }
}