import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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
            return this.prisma.profile.create({
                data: {
                    userId,
                    fullName: dto.fullName ?? '',
                    ...dto,
                },
            });
        }

        return this.prisma.profile.update({
            where: {
                userId,
            },
            data: dto,
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