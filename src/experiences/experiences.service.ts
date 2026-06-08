import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateExperienceDto } from 'src/auth/dto/create-experience.dto';
import { UpdateExperienceDto } from 'src/auth/dto/update-experience.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExperiencesService {
    constructor(private prisma: PrismaService) { }

    create(userId: string, dto: CreateExperienceDto) {
        return this.prisma.experience.create({
            data: {
                userId,
                company: dto.company,
                position: dto.position,
                description: dto.description,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                companyLogo: dto.companyLogo,
                isPublic: dto.isPublic ?? true,
            },
        });
    }

    findMine(userId: string) {
        return this.prisma.experience.findMany({
            where: { userId },
            include: {
                projects: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });
    }

    findAllAdmin(query: {
        userId?: string;
        company?: string;
        search?: string;
        page: number;
        limit: number;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        return this.prisma.experience.findMany({
            where: {
                ...(query.userId && {
                    userId: query.userId,
                }),

                ...(query.company && {
                    company: {
                        contains: query.company,
                        mode: 'insensitive',
                    },
                }),

                ...(query.search && {
                    OR: [
                        {
                            company: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            position: {
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
                projects: true,
            },

            orderBy: {
                createdAt: 'desc',
            },

            skip,
            take: limit,
        });
    }

    async update(
        userId: string,
        experienceId: string,
        dto: UpdateExperienceDto,
        isAdmin = false,
    ) {
        const experience =
            await this.prisma.experience.findUnique({
                where: { id: experienceId },
            });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        if (!isAdmin && experience.userId !== userId) {
            throw new ForbiddenException(
                'You can only update your own experience',
            );
        }

        return this.prisma.experience.update({
            where: { id: experienceId },
            data: {
                company: dto.company,
                position: dto.position,
                description: dto.description,
                startDate: dto.startDate
                    ? new Date(dto.startDate)
                    : undefined,
                endDate: dto.endDate
                    ? new Date(dto.endDate)
                    : undefined,
                companyLogo: dto.companyLogo,
                isPublic: dto.isPublic,
            },
        });
    }

    async remove(userId: string, experienceId: string, isAdmin = false) {
        const experience =
            await this.prisma.experience.findUnique({
                where: { id: experienceId },
            });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        if (!isAdmin && experience.userId !== userId) {
            throw new ForbiddenException(
                'You can only delete your own experience',
            );
        }

        return this.prisma.experience.delete({
            where: { id: experienceId },
        });
    }

    async findOneMine(userId: string, experienceId: string, isAdmin = false) {
        const experience =
            await this.prisma.experience.findUnique({
                where: { id: experienceId },
                include: {
                    projects: true,
                },
            });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        if (!isAdmin && experience.userId !== userId) {
            throw new ForbiddenException(
                'You can only access your own experience',
            );
        }

        return experience;
    }

    findPublicByUser(userId: string) {
        return this.prisma.experience.findMany({
            where: {
                userId,
                isPublic: true,
            },
            include: {
                projects: {
                    where: {
                        isPublic: true,
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });
    }

    async findOnePublic(userId: string, experienceId: string) {
        const experience =
            await this.prisma.experience.findFirst({
                where: {
                    id: experienceId,
                    userId,
                    isPublic: true,
                },
                include: {
                    projects: {
                        where: {
                            isPublic: true,
                        },
                    },
                },
            });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        return experience;
    }
}