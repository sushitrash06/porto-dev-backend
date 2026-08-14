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
        const existingProfile =
            await this.prisma.profile.findUnique({
                where: {
                    userId,
                },
            });

        if (!existingProfile) {
            throw new NotFoundException('Personal profile not found');
        }

        return this.prisma.profile.update({
            where: {
                userId,
            },
            data: dto,
        });
    }

    async updateProfileImage(
        userId: string,
        imageUrl: string,
    ) {
        return this.prisma.profile.update({
            where: {
                userId,
            },

            data: {
                profileImage: imageUrl,
            },
        });
    }

    async updateProfileBanner(
        userId: string,
        imageUrl: string,
    ) {
        return this.prisma.profile.update({
            where: {
                userId,
            },

            data: {
                bannerImage: imageUrl,
            },
        });
    }

    async updateProfileCv(
        userId: string,
        cvUrl: string,
    ) {
        return this.prisma.profile.update({
            where: {
                userId,
            },

            data: {
                cvUrl,
            },
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