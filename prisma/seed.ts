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
                    textSecondaryColor: '#94A3B8',
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

    console.log('DEFAULT DEVELOPER TEMPLATE SEEDED');

    await prisma.template.upsert({
        where: { slug: 'modern-agency' },
        update: {},
        create: {
            slug: 'modern-agency',
            name: 'Modern Agency & Studio',
            description: 'Template premium bernuansa korporat modern untuk digital agency, software house, dan studio kreatif dengan social proof, testimoni, dan kalkulator layanan.',
            category: 'BUSINESS',
            isPublished: true,
            isDefault: true,
            version: 1,
            createdById: admin.id,
            layoutConfig: {
                theme: {
                    fontFamily: 'Plus Jakarta Sans',
                    primaryColor: '#2563EB',
                    secondaryColor: '#38BDF8',
                    backgroundColor: '#0F172A',
                    surfaceColor: '#1E293B',
                    textColor: '#F8FAFC',
                    textSecondaryColor: '#94A3B8',
                    borderRadius: '16px',
                    darkMode: true,
                },
                sections: [
                    {
                        id: 'sec-biz-hero',
                        type: 'HERO_PROFILE',
                        title: 'Brand Hero',
                        variant: 'BUSINESS_HERO',
                        isVisible: true,
                        props: { showBanner: true, showLogo: true },
                    },
                    {
                        id: 'sec-biz-clients',
                        type: 'CLIENTS_LOGO',
                        title: 'Trusted by Leaders',
                        variant: 'MARQUEE_GRID',
                        isVisible: true,
                        props: {
                            title: 'Trusted by Leading Brands & Startups',
                            logos: [
                                { name: 'Acme Technologies', logoUrl: '' },
                                { name: 'Starlight Ventures', logoUrl: '' },
                                { name: 'Nexus Dynamics', logoUrl: '' },
                                { name: 'Apex Studios', logoUrl: '' },
                            ],
                        },
                    },
                    {
                        id: 'sec-biz-about',
                        type: 'ABOUT_ME',
                        title: 'About Company',
                        variant: 'COMPANY_OVERVIEW',
                        isVisible: true,
                        props: {},
                    },
                    {
                        id: 'sec-biz-services',
                        type: 'SERVICES_GRID',
                        title: 'Our Services',
                        variant: 'CARD_GRID_3COL',
                        isVisible: true,
                        props: { showPricing: true },
                    },
                    {
                        id: 'sec-biz-stats',
                        type: 'COMPANY_STATS',
                        title: 'Track Record',
                        variant: 'STATS_COUNTER',
                        isVisible: true,
                        props: {
                            stats: [
                                { value: '50+', label: 'Projects Completed' },
                                { value: '99%', label: 'Client Satisfaction' },
                                { value: '5+', label: 'Years in Business' },
                                { value: '15+', label: 'Specialists' },
                            ],
                        },
                    },
                    {
                        id: 'sec-biz-projects',
                        type: 'PROJECT_LIST',
                        title: 'Featured Case Studies',
                        variant: 'PORTFOLIO_SHOWCASE',
                        isVisible: true,
                        props: { limit: 6 },
                    },
                    {
                        id: 'sec-biz-process',
                        type: 'PROCESS_WORKFLOW',
                        title: 'Our Working Process',
                        variant: 'STEP_CARDS',
                        isVisible: true,
                        props: {
                            steps: [
                                {
                                    step: '01',
                                    title: 'Discovery & Scope',
                                    description: 'Deep dive into requirements, system architecture, and goal alignment.',
                                },
                                {
                                    step: '02',
                                    title: 'UI/UX & Prototyping',
                                    description: 'Crafting responsive user interfaces with seamless design systems.',
                                },
                                {
                                    step: '03',
                                    title: 'Agile Development',
                                    description: 'Clean coding standards, sprint demos, and automated quality testing.',
                                },
                                {
                                    step: '04',
                                    title: 'Deployment & SLA',
                                    description: 'Smooth cloud deployment, documentation handover, and ongoing support.',
                                },
                            ],
                        },
                    },
                    {
                        id: 'sec-biz-testimonials',
                        type: 'TESTIMONIALS',
                        title: 'Client Testimonials',
                        variant: 'TESTIMONIAL_CAROUSEL',
                        isVisible: true,
                        props: {
                            testimonials: [
                                {
                                    clientName: 'Alexander Wright',
                                    clientRole: 'VP of Product',
                                    clientCompany: 'FinTech Innovations',
                                    avatarUrl: '',
                                    rating: 5,
                                    content:
                                        'They delivered our core MVP 2 weeks ahead of schedule. The engineering discipline and communication throughout the sprints were outstanding.',
                                },
                            ],
                        },
                    },
                    {
                        id: 'sec-biz-faq',
                        type: 'FAQ_ACCORDION',
                        title: 'Frequently Asked Questions',
                        variant: 'ACCORDION_LIST',
                        isVisible: true,
                        props: {
                            faqs: [
                                {
                                    question: 'What is the typical timeline for an agency project?',
                                    answer: 'Most MVPs and web solutions are completed within 4 to 8 weeks depending on complexity.',
                                },
                                {
                                    question: 'Do you offer post-launch maintenance & bug warranty?',
                                    answer: 'Yes, we provide 30 days of complimentary bug warranty and flexible monthly SLA maintenance retainer plans.',
                                },
                                {
                                    question: 'Who owns the intellectual property and code repository?',
                                    answer: 'You own 100% of all intellectual property, git repositories, and design assets upon project delivery.',
                                },
                            ],
                        },
                    },
                    {
                        id: 'sec-biz-cta',
                        type: 'CTA_BANNER',
                        title: 'Ready to Build?',
                        variant: 'GRADIENT_BANNER',
                        isVisible: true,
                        props: {
                            title: 'Have a project in mind? Let’s make it happen.',
                            description: 'Book a free 15-minute discovery consultation to discuss scope, timeline, and tech stack.',
                            primaryButtonText: 'Schedule Consultation',
                            primaryButtonUrl: '#contact',
                        },
                    },
                    {
                        id: 'sec-biz-contact',
                        type: 'CONTACT_SECTION',
                        title: 'Get In Touch',
                        variant: 'BUSINESS_CONTACT_CARD',
                        isVisible: true,
                        props: {},
                    },
                ],
            },
        },
    });

    console.log('DEFAULT BUSINESS TEMPLATE SEEDED');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });