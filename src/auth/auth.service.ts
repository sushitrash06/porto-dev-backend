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
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: 'USER',

                profile: {
                    create: {
                        fullName: '',
                        skills: [],
                        services: [],
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
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

        return {
            message: 'Password changed successfully',
        };
    }
}