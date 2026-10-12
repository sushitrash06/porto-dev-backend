import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class PortfolioService {
    constructor(
        private prisma: PrismaService,
        private templatesService: TemplatesService,
    ) { }

    async getPublicPortfolio(userId: string) {
        const profile = await this.prisma.profile.findFirst({
            where: {
                userId,
                isPublic: true,
            },
            include: {
                template: true,
            },
        });

        if (!profile) {
            throw new NotFoundException('Portfolio not found');
        }

        let baseLayoutConfig = profile.template?.layoutConfig;

        if (!baseLayoutConfig) {
            const defaultTemplate = await this.prisma.template.findFirst({
                where: { isDefault: true, isPublished: true },
            });
            baseLayoutConfig = defaultTemplate?.layoutConfig;
        }

        const layout = this.templatesService.resolveLayout(
            baseLayoutConfig,
            profile.userCustomConfig,
        );

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
            layout,
        };
    }
}