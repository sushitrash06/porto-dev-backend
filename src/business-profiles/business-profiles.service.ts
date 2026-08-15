import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessProfileDto } from 'src/auth/dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from 'src/auth/dto/update-business-profile.dto';

@Injectable()
export class BusinessProfilesService {
    constructor(private prisma: PrismaService) { }

    async getMyProfile(userId: string) {
        return this.prisma.businessProfile.findUnique({
            where: { userId },
            include: {
                services: true,
                projects: true,
            },
        });
    }

    async createProfile(userId: string, dto: CreateBusinessProfileDto) {
        const existing = await this.prisma.businessProfile.findUnique({
            where: { userId },
        });

        if (existing) {
            throw new ConflictException('Business profile already exists');
        }

        return this.prisma.businessProfile.create({
            data: {
                userId,
                businessName: dto.businessName ?? '',
                description: dto.description,
                contactEmail: dto.contactEmail,
                phoneNumber: dto.phoneNumber,
                location: dto.location,
                website: dto.website,
                isPublic: dto.isPublic ?? true,
            },
        });
    }

    async updateProfile(
        userId: string,
        dto: UpdateBusinessProfileDto,
    ) {
        return this.prisma.businessProfile.upsert({
            where: { userId },
            update: dto,
            create: {
                userId,
                businessName: dto.businessName ?? 'New Business',
                ...dto,
            }
        });
    }

    async updateLogo(userId: string, imageUrl: string) {
        return this.prisma.businessProfile.upsert({
            where: { userId },
            update: { logo: imageUrl },
            create: {
                userId,
                businessName: 'New Business',
                logo: imageUrl,
            }
        });
    }

    async updateBanner(userId: string, imageUrl: string) {
        return this.prisma.businessProfile.upsert({
            where: { userId },
            update: { bannerImage: imageUrl },
            create: {
                userId,
                businessName: 'New Business',
                bannerImage: imageUrl,
            }
        });
    }

    async getPublicProfile(userId: string) {
        const profile =
            await this.prisma.businessProfile.findFirst({
                where: {
                    userId,
                    isPublic: true,
                },
                include: {
                    services: {
                        where: { isPublic: true },
                        orderBy: { createdAt: 'desc' },
                    },
                    projects: {
                        where: { isPublic: true },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });

        if (!profile) {
            throw new NotFoundException(
                'Business profile not found',
            );
        }

        return profile;
    }
}
