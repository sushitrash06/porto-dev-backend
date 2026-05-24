import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash(
        'admin123',
        10,
    );

    await prisma.user.upsert({
        where: {
            email: 'admin@porto.dev',
        },
        update: {},
        create: {
            email: 'admin@porto.dev',
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
        },
    });

    console.log('SUPER ADMIN CREATED');
}

main();