import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from 'src/auth/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';

import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ProfilesService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getMyProfile(userId: string) {
        return this.prisma.profile.findUnique({
            where: {
                userId,
            },
        });
    }

    async createProfile(userId: string, dto: CreateProfileDto) {
        const existingProfile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            throw new ConflictException('Personal profile already exists');
        }

        return this.prisma.profile.create({
            data: {
                userId,
                ...dto,
            },
        });
    }

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        return this.prisma.profile.upsert({
            where: {
                userId,
            },
            update: dto,
            create: {
                userId,
                fullName: dto.fullName ?? 'New User',
                ...dto,
            }
        });
    }

    async updateProfileImage(
        userId: string,
        imageUrl: string,
    ) {
        return this.prisma.profile.upsert({
            where: {
                userId,
            },
            update: {
                profileImage: imageUrl,
            },
            create: {
                userId,
                fullName: 'New User',
                profileImage: imageUrl,
            }
        });
    }

    async updateProfileBanner(
        userId: string,
        imageUrl: string,
    ) {
        return this.prisma.profile.upsert({
            where: {
                userId,
            },
            update: {
                bannerImage: imageUrl,
            },
            create: {
                userId,
                fullName: 'New User',
                bannerImage: imageUrl,
            }
        });
    }

    async updateProfileCv(
        userId: string,
        cvUrl: string,
    ) {
        return this.prisma.profile.upsert({
            where: {
                userId,
            },
            update: {
                cvUrl,
            },
            create: {
                userId,
                fullName: 'New User',
                cvUrl,
            }
        });
    }
    async getPublicProfile(userId: string) {
        const profile =
            await this.prisma.profile.findFirst({
                where: {
                    userId,
                    isPublic: true,
                },
            });

        if (!profile) {
            throw new NotFoundException(
                'Profile not found',
            );
        }

        return profile;
    }
}