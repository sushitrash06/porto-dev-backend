import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';


import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
    ) { }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(dto: CreateUserDto) {
        const existingUser =
            await this.findByEmail(dto.email);

        if (existingUser) {
            throw new ConflictException(
                'Email already exists',
            );
        }

        const hashedPassword =
            await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: dto.role,
            },
        });
    }

    async findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const where = query.search
            ? {
                email: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                },
            }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    profile: {
                        select: {
                            fullName: true,
                            profileImage: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),

            this.prisma.user.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updatePassword(id: string, passwordHash: string) {
        return this.prisma.user.update({
            where: { id },
            data: { password: passwordHash },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const data: any = {};

        if (dto.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('Email already exists');
            }
            data.email = dto.email;
        }

        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }

        if (dto.role) {
            data.role = dto.role;
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                role: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                email: true,
            },
        });
    }
}