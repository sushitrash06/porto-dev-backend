import {
    Injectable,
    ConflictException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';


import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

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

                profile: {
                    create: {
                        fullName: '',
                        skills: [],
                        services: [],
                    },
                },
            },

            include: {
                profile: true,
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
}