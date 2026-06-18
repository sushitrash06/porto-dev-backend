import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessProjectDto } from 'src/auth/dto/create-business-project.dto';
import { UpdateBusinessProjectDto } from 'src/auth/dto/update-business-project.dto';

@Injectable()
export class BusinessProjectsService {
    constructor(private prisma: PrismaService) { }

    private async getBusinessProfileId(userId: string) {
        const profile =
            await this.prisma.businessProfile.findUnique({
                where: { userId },
                select: { id: true },
            });

        if (!profile) {
            throw new NotFoundException(
                'Business profile not found. Please create a business profile first.',
            );
        }

        return profile.id;
    }

    private async validateOwnership(
        userId: string,
        projectId: string,
        isAdmin = false,
    ) {
        const project =
            await this.prisma.businessProject.findUnique({
                where: { id: projectId },
                include: {
                    businessProfile: {
                        select: { userId: true },
                    },
                },
            });

        if (!project) {
            throw new NotFoundException(
                'Business project not found',
            );
        }

        if (
            !isAdmin &&
            project.businessProfile.userId !== userId
        ) {
            throw new ForbiddenException(
                'You can only manage your own business projects',
            );
        }

        return project;
    }

    async create(
        userId: string,
        dto: CreateBusinessProjectDto,
    ) {
        const businessProfileId =
            await this.getBusinessProfileId(userId);

        return this.prisma.businessProject.create({
            data: {
                businessProfileId,
                title: dto.title,
                location: dto.location,
                year: dto.year,
                description: dto.description,
                projectType: dto.projectType ?? 'OTHER',
                clientName: dto.clientName,
                thumbnail: dto.thumbnail,
                images: dto.images ?? [],
                isPublic: dto.isPublic ?? true,
            },
        });
    }

    async findMine(userId: string) {
        const businessProfileId =
            await this.getBusinessProfileId(userId);

        return this.prisma.businessProject.findMany({
            where: { businessProfileId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(
        userId: string,
        projectId: string,
        isAdmin = false,
    ) {
        return this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );
    }

    async update(
        userId: string,
        projectId: string,
        dto: UpdateBusinessProjectDto,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );

        return this.prisma.businessProject.update({
            where: { id: projectId },
            data: {
                title: dto.title,
                location: dto.location,
                year: dto.year,
                description: dto.description,
                projectType: dto.projectType,
                clientName: dto.clientName,
                thumbnail: dto.thumbnail,
                images: dto.images,
                isPublic: dto.isPublic,
            },
        });
    }

    async updateThumbnail(
        userId: string,
        projectId: string,
        imageUrl: string,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );

        return this.prisma.businessProject.update({
            where: { id: projectId },
            data: { thumbnail: imageUrl },
        });
    }

    async addImage(
        userId: string,
        projectId: string,
        imageUrl: string,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );

        return this.prisma.businessProject.update({
            where: { id: projectId },
            data: {
                images: { push: imageUrl },
            },
        });
    }

    async removeImage(
        userId: string,
        projectId: string,
        imageUrl: string,
        isAdmin = false,
    ) {
        const project = await this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );

        return this.prisma.businessProject.update({
            where: { id: projectId },
            data: {
                images: project.images.filter(
                    (img) => img !== imageUrl,
                ),
            },
        });
    }

    async remove(
        userId: string,
        projectId: string,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            projectId,
            isAdmin,
        );

        return this.prisma.businessProject.delete({
            where: { id: projectId },
        });
    }

    findPublicByUser(userId: string) {
        return this.prisma.businessProject.findMany({
            where: {
                businessProfile: {
                    userId,
                    isPublic: true,
                },
                isPublic: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOnePublic(userId: string, projectId: string) {
        const project =
            await this.prisma.businessProject.findFirst({
                where: {
                    id: projectId,
                    businessProfile: {
                        userId,
                        isPublic: true,
                    },
                    isPublic: true,
                },
            });

        if (!project) {
            throw new NotFoundException(
                'Business project not found',
            );
        }

        return project;
    }
}
