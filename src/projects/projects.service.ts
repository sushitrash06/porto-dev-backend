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

    async updateThumbnail(
        userId: string,
        projectId: string,
        imageUrl: string,
    ) {
        const project =
            await this.prisma.project.findUnique({
                where: {
                    id: projectId,
                },
            });

        if (!project) {
            throw new NotFoundException(
                'Project not found',
            );
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                'You can only update your own project',
            );
        }

        return this.prisma.project.update({
            where: {
                id: projectId,
            },

            data: {
                thumbnail: imageUrl,
            },
        });
    }

    async addProjectImage(
        userId: string,
        projectId: string,
        imageUrl: string,
    ) {
        const project =
            await this.prisma.project.findUnique({
                where: {
                    id: projectId,
                },
            });

        if (!project) {
            throw new NotFoundException(
                'Project not found',
            );
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                'You can only update your own project',
            );
        }

        return this.prisma.project.update({
            where: {
                id: projectId,
            },

            data: {
                images: {
                    push: imageUrl,
                },
            },
        });
    }

    findAllAdmin(query: {
        userId?: string;
        type?: string;
        search?: string;
        page: number;
        limit: number;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        return this.prisma.project.findMany({
            where: {
                ...(query.userId && {
                    userId: query.userId,
                }),

                ...(query.type && {
                    type: query.type as any,
                }),

                ...(query.search && {
                    OR: [
                        {
                            title: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            role: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            techStacks: {
                                has: query.search,
                            },
                        },
                    ],
                }),
            },

            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                experience: true,
            },

            orderBy: {
                createdAt: 'desc',
            },

            skip,
            take: limit,
        });
    }



    async findOneOwned(userId: string, projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                'You can only access your own project',
            );
        }

        return project;
    }

    async removeProjectImage(
        userId: string,
        projectId: string,
        imageUrl: string,
    ) {
        const project =
            await this.findOneOwned(
                userId,
                projectId,
            );

        return this.prisma.project.update({
            where: {
                id: projectId,
            },

            data: {
                images: project.images.filter(
                    (img) => img !== imageUrl,
                ),
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

    async findOnePublic(userId: string, projectId: string) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
                isPublic: true,
            },
            include: {
                experience: true,
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }
}