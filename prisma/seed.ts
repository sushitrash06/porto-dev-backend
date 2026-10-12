import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash(
        'admin123',
        10,
    );

    const admin = await prisma.user.upsert({
        where: {
            email: 'admin@porto.dev',
        },
        update: {},
        create: {
            email: 'admin@porto.dev',
            password: hashedPassword,
            role: Role.ADMIN,
            isEmailVerified: true,
        },
    });

    console.log('SUPER ADMIN CREATED');

    await prisma.template.upsert({
        where: { slug: 'modern-developer' },
        update: {},
        create: {
            slug: 'modern-developer',
            name: 'Modern Developer (Bento Grid)',
            description: 'Template modern bernuansa dark mode dengan bento grid layout untuk developer dan software engineer.',
            category: 'DEVELOPER',
            isPublished: true,
            isDefault: true,
            version: 1,
            createdById: admin.id,
            layoutConfig: {
                theme: {
                    fontFamily: 'Plus Jakarta Sans',
                    primaryColor: '#6366F1',
                    secondaryColor: '#EC4899',
                    backgroundColor: '#0F172A',
                    surfaceColor: '#1E293B',
                    textColor: '#F8FAFC',
                    borderRadius: '16px',
                    darkMode: true,
                },
                sections: [
                    {
                        id: 'sec-hero-1',
                        type: 'HERO_PROFILE',
                        title: 'Profile Intro',
                        variant: 'MODERN_SPLIT',
                        isVisible: true,
                        props: {
                            showBanner: true,
                            avatarShape: 'rounded',
                            showSocialLinks: true,
                        },
                    },
                    {
                        id: 'sec-skills-2',
                        type: 'SKILLS_LIST',
                        title: 'Tech Stack & Skills',
                        variant: 'MARQUEE_PILLS',
                        isVisible: true,
                        props: {
                            showCategory: true,
                            animated: true,
                        },
                    },
                    {
                        id: 'sec-projects-3',
                        type: 'PROJECT_LIST',
                        title: 'Featured Projects',
                        variant: 'BENTO_GRID_3COL',
                        isVisible: true,
                        props: {
                            limit: 6,
                            featuredOnly: false,
                            cardHoverEffect: 'glow',
                        },
                    },
                    {
                        id: 'sec-experiences-4',
                        type: 'EXPERIENCE_TIMELINE',
                        title: 'Work Experience',
                        variant: 'MINIMAL_LIST',
                        isVisible: true,
                        props: {
                            showDuration: true,
                            showCompanyLogo: true,
                        },
                    },
                    {
                        id: 'sec-contact-5',
                        type: 'CONTACT_SECTION',
                        title: 'Get In Touch',
                        variant: 'CARD_CTA',
                        isVisible: true,
                        props: {
                            showEmail: true,
                            showPhoneNumber: true,
                        },
                    },
                ],
            },
        },
    });

    console.log('DEFAULT TEMPLATE SEEDED');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });