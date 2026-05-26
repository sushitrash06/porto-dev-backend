import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PortfolioService {
    constructor(private prisma: PrismaService) { }

    async getPublicPortfolio(userId: string) {
        const profile = await this.prisma.profile.findFirst({
            where: {
                userId,
                isPublic: true,
            },
        });

        if (!profile) {
            throw new NotFoundException('Portfolio not found');
        }

        const experiences = await this.prisma.experience.findMany({
            where: {
                userId,
                isPublic: true,
            },
            include: {
                projects: {
                    where: {
                        isPublic: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        const projects = await this.prisma.project.findMany({
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

        return {
            profile,
            experiences,
            projects,
        };
    }
}