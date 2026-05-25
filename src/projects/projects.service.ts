import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from 'src/auth/dto/create-projects.dto';
import { UpdateProjectDto } from 'src/auth/dto/update-projects.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    private async validateExperienceOwnership(
        userId: string,
        experienceId?: string,
    ) {
        if (!experienceId) return;

        const experience =
            await this.prisma.experience.findUnique({
                where: { id: experienceId },
            });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        if (experience.userId !== userId) {
            throw new ForbiddenException(
                'You can only attach your own experience',
            );
        }
    }

    async create(userId: string, dto: CreateProjectDto) {
        await this.validateExperienceOwnership(
            userId,
            dto.experienceId,
        );

        return this.prisma.project.create({
            data: {
                userId,
                experienceId: dto.experienceId || null,
                type: dto.type ?? 'PERSONAL',
                title: dto.title,
                description: dto.description,
                thumbnail: dto.thumbnail,
                images: dto.images ?? [],
                techStacks: dto.techStacks ?? [],
                projectUrl: dto.projectUrl,
                githubUrl: dto.githubUrl,
                role: dto.role,
                isPublic: dto.isPublic ?? true,
            },
            include: {
                experience: true,
            },
        });
    }

    findMine(userId: string) {
        return this.prisma.project.findMany({
            where: { userId },
            include: {
                experience: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async update(
        userId: string,
        projectId: string,
        dto: UpdateProjectDto,
    ) {
        const project =
            await this.prisma.project.findUnique({
                where: { id: projectId },
            });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                'You can only update your own project',
            );
        }

        await this.validateExperienceOwnership(
            userId,
            dto.experienceId,
        );

        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                experienceId:
                    dto.experienceId === undefined
                        ? undefined
                        : dto.experienceId || null,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                thumbnail: dto.thumbnail,
                images: dto.images,
                techStacks: dto.techStacks,
                projectUrl: dto.projectUrl,
                githubUrl: dto.githubUrl,
                role: dto.role,
                isPublic: dto.isPublic,
            },
            include: {
                experience: true,
            },
        });
    }

    async remove(userId: string, projectId: string) {
        const project =
            await this.prisma.project.findUnique({
                where: { id: projectId },
            });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                'You can only delete your own project',
            );
        }

        return this.prisma.project.delete({
            where: { id: projectId },
        });
    }

    findPublicByUser(userId: string) {
        return this.prisma.project.findMany({
            where: {
                userId,
                isPublic: true,
            },
            include: {
                experience: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}