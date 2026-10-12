import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { TemplatesService } from 'src/templates/templates.service';
import { TemplateCategory } from '@prisma/client';
import { CreateBusinessProfileDto } from 'src/auth/dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from 'src/auth/dto/update-business-profile.dto';

@Injectable()
export class BusinessProfilesService {
    constructor(
        private prisma: PrismaService,
        private templatesService: TemplatesService,
    ) { }

    async getMyProfile(userId: string) {
        return (this.prisma as any).businessProfile.findUnique({
            where: { userId },
            include: {
                template: true,
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
        const profile: any =
            await (this.prisma as any).businessProfile.findFirst({
                where: {
                    userId,
                    isPublic: true,
                },
                include: {
                    template: true,
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

        let baseLayoutConfig = profile.template?.layoutConfig;
        if (!baseLayoutConfig) {
            const defaultTemplate =
                (await this.prisma.template.findFirst({
                    where: {
                        isDefault: true,
                        isPublished: true,
                        category: TemplateCategory.BUSINESS,
                    },
                })) ||
                (await this.prisma.template.findFirst({
                    where: { isDefault: true, isPublished: true },
                }));
            baseLayoutConfig = defaultTemplate?.layoutConfig;
        }

        const layout = this.templatesService.resolveLayout(
            baseLayoutConfig,
            profile.userCustomConfig,
            TemplateCategory.BUSINESS,
        );

        return {
            ...profile,
            layout,
        };
    }
}
