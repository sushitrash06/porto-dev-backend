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

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }
}