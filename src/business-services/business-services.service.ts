import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessServiceDto } from 'src/auth/dto/create-business-service.dto';
import { UpdateBusinessServiceDto } from 'src/auth/dto/update-business-service.dto';

@Injectable()
export class BusinessServicesService {
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
        serviceId: string,
        isAdmin = false,
    ) {
        const service =
            await this.prisma.businessService.findUnique({
                where: { id: serviceId },
                include: {
                    businessProfile: {
                        select: { userId: true },
                    },
                },
            });

        if (!service) {
            throw new NotFoundException(
                'Business service not found',
            );
        }

        if (
            !isAdmin &&
            service.businessProfile.userId !== userId
        ) {
            throw new ForbiddenException(
                'You can only manage your own business services',
            );
        }

        return service;
    }

    async create(userId: string, dto: CreateBusinessServiceDto) {
        const businessProfileId =
            await this.getBusinessProfileId(userId);

        return this.prisma.businessService.create({
            data: {
                businessProfileId,
                name: dto.name,
                description: dto.description,
                priceStartFrom: dto.priceStartFrom,
                isPublic: dto.isPublic ?? true,
            },
        });
    }

    async findMine(userId: string) {
        const businessProfileId =
            await this.getBusinessProfileId(userId);

        return this.prisma.businessService.findMany({
            where: { businessProfileId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(
        userId: string,
        serviceId: string,
        isAdmin = false,
    ) {
        return this.validateOwnership(
            userId,
            serviceId,
            isAdmin,
        );
    }

    async update(
        userId: string,
        serviceId: string,
        dto: UpdateBusinessServiceDto,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            serviceId,
            isAdmin,
        );

        return this.prisma.businessService.update({
            where: { id: serviceId },
            data: {
                name: dto.name,
                description: dto.description,
                priceStartFrom: dto.priceStartFrom,
                isPublic: dto.isPublic,
            },
        });
    }

    async remove(
        userId: string,
        serviceId: string,
        isAdmin = false,
    ) {
        await this.validateOwnership(
            userId,
            serviceId,
            isAdmin,
        );

        return this.prisma.businessService.delete({
            where: { id: serviceId },
        });
    }

    findPublicByUser(userId: string) {
        return this.prisma.businessService.findMany({
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

    async findOnePublic(userId: string, serviceId: string) {
        const service =
            await this.prisma.businessService.findFirst({
                where: {
                    id: serviceId,
                    businessProfile: {
                        userId,
                        isPublic: true,
                    },
                    isPublic: true,
                },
            });

        if (!service) {
            throw new NotFoundException(
                'Business service not found',
            );
        }

        return service;
    }
}
