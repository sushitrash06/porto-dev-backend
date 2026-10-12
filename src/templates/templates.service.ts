import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma, TemplateCategory } from '@prisma/client';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpdateUserThemeDto } from './dto/update-user-theme.dto';
import { LayoutConfig, SectionBlock, UserCustomConfig } from './interfaces/layout-config.interface';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── ADMIN BUILDER METHODS ──────────────────────────────────────────────────

  async create(userId: string, dto: CreateTemplateDto) {
    const existing = await this.prisma.template.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Template with slug '${dto.slug}' already exists`);
    }

    if (dto.isDefault) {
      await this.prisma.template.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.template.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        category: dto.category ?? TemplateCategory.DEVELOPER,
        isPublished: dto.isPublished ?? false,
        isDefault: dto.isDefault ?? false,
        layoutConfig: dto.layoutConfig as any,
        createdById: userId,
      },
    });
  }

  async findAllAdmin(query: {
    search?: string;
    category?: TemplateCategory;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, category, isPublished, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        include: {
          createdByUser: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: { profiles: true },
          },
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneAdmin(id: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        createdByUser: {
          select: { id: true, email: true },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template '${id}' not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const template = await this.findOneAdmin(id);

    if (dto.slug && dto.slug !== template.slug) {
      const existing = await this.prisma.template.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Template with slug '${dto.slug}' already exists`);
      }
    }

    if (dto.isDefault) {
      await this.prisma.template.updateMany({
        where: { isDefault: true, id: { not: template.id } },
        data: { isDefault: false },
      });
    }

    const newVersion = dto.layoutConfig ? template.version + 1 : template.version;

    return this.prisma.template.update({
      where: { id: template.id },
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        category: dto.category,
        isPublished: dto.isPublished,
        isDefault: dto.isDefault,
        layoutConfig: dto.layoutConfig ? (dto.layoutConfig as any) : undefined,
        version: newVersion,
      },
    });
  }

  async publish(id: string, isPublished: boolean) {
    const template = await this.findOneAdmin(id);
    return this.prisma.template.update({
      where: { id: template.id },
      data: { isPublished },
    });
  }

  async clone(id: string, adminUserId: string) {
    const original = await this.findOneAdmin(id);

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newSlug = `${original.slug}-copy-${randomSuffix}`;
    const newName = `${original.name} (Copy)`;

    return this.prisma.template.create({
      data: {
        slug: newSlug,
        name: newName,
        description: original.description,
        thumbnail: original.thumbnail,
        category: original.category,
        isPublished: false,
        isDefault: false,
        version: 1,
        layoutConfig: original.layoutConfig as any,
        createdById: adminUserId,
      },
    });
  }

  async delete(id: string) {
    const template = await this.findOneAdmin(id);

    if (template.thumbnail) {
      await this.cloudinaryService.deleteImageByUrl(template.thumbnail);
    }

    return this.prisma.template.delete({
      where: { id: template.id },
    });
  }

  async uploadThumbnail(id: string, file: Express.Multer.File) {
    const template = await this.findOneAdmin(id);

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadRes = await this.cloudinaryService.uploadFile(file, 'templates', 'image');
    const thumbnailUrl = uploadRes?.secure_url;

    if (template.thumbnail) {
      await this.cloudinaryService.deleteImageByUrl(template.thumbnail);
    }

    return this.prisma.template.update({
      where: { id: template.id },
      data: { thumbnail: thumbnailUrl },
    });
  }

  // ─── USER & PUBLIC METHODS ──────────────────────────────────────────────────

  async findAllPublished(category?: TemplateCategory) {
    return this.prisma.template.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnail: true,
        category: true,
        isDefault: true,
        layoutConfig: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOnePublished(idOrSlug: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        isPublished: true,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnail: true,
        category: true,
        layoutConfig: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found or not published');
    }

    return template;
  }

  async applyTemplateToProfile(userId: string, templateIdOrSlug: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        isPublished: true,
        OR: [{ id: templateIdOrSlug }, { slug: templateIdOrSlug }],
      },
    });

    if (!template) {
      throw new NotFoundException('Selected template not found or not published');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found. Please create a profile first.');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        templateId: template.id,
      },
      include: {
        template: true,
      },
    });
  }

  async getMyTheme(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        template: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found. Please create a profile first.');
    }

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: { isDefault: true, isPublished: true },
      });
    }

    const baseConfig = template?.layoutConfig;
    const resolvedLayout = this.resolveLayout(baseConfig, profile.userCustomConfig);

    return {
      template,
      userCustomConfig: profile.userCustomConfig,
      resolvedLayout,
    };
  }

  async updateUserCustomConfig(userId: string, dto: UpdateUserThemeDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const existingConfig = (profile.userCustomConfig as UserCustomConfig) || {};
    const updatedConfig: UserCustomConfig = {
      theme: {
        ...(existingConfig.theme || {}),
        ...(dto.theme || {}),
      },
      sections: dto.sections ?? existingConfig.sections,
    };

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        userCustomConfig: updatedConfig as any,
      },
      include: { template: true },
    });

    let template = updatedProfile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: { isDefault: true, isPublished: true },
      });
    }

    const resolvedLayout = this.resolveLayout(template?.layoutConfig, updatedConfig);

    return {
      profile: updatedProfile,
      userCustomConfig: updatedConfig,
      resolvedLayout,
    };
  }

  async reorderMySections(userId: string, sectionIds: string[]) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: { isDefault: true, isPublished: true },
      });
    }

    const baseLayout = (template?.layoutConfig as any) || {};
    const baseSections: any[] = baseLayout.sections || [];
    const existingConfig = (profile.userCustomConfig as UserCustomConfig) || {};
    const existingSections = existingConfig.sections || [];

    const existingMap = new Map(existingSections.map((s) => [s.id, s]));
    const baseMap = new Map(baseSections.map((s) => [s.id, s]));

    const orderedSections = sectionIds.map((id) => {
      const override = existingMap.get(id);
      const baseSec = baseMap.get(id);
      return {
        id,
        isVisible: override?.isVisible !== undefined ? override.isVisible : (baseSec?.isVisible ?? true),
        props: {
          ...(baseSec?.props || {}),
          ...(override?.props || {}),
        },
      };
    });

    const updatedConfig: UserCustomConfig = {
      ...existingConfig,
      sections: orderedSections,
    };

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        userCustomConfig: updatedConfig as any,
      },
    });

    const resolvedLayout = this.resolveLayout(baseLayout, updatedConfig);

    return {
      message: 'Sections reordered successfully',
      userCustomConfig: updatedConfig,
      resolvedLayout,
    };
  }

  async resetUserCustomConfig(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    await this.prisma.profile.update({
      where: { userId },
      data: {
        userCustomConfig: Prisma.DbNull,
      },
    });

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: { isDefault: true, isPublished: true },
      });
    }

    const resolvedLayout = this.resolveLayout(template?.layoutConfig, null);

    return {
      message: 'Theme customization reset to template default',
      resolvedLayout,
    };
  }

  // ─── BUSINESS PROFILE THEME METHODS ─────────────────────────────────────────

  async applyTemplateToBusinessProfile(userId: string, templateIdOrSlug: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        isPublished: true,
        OR: [{ id: templateIdOrSlug }, { slug: templateIdOrSlug }],
      },
    });

    if (!template) {
      throw new NotFoundException('Selected template not found or not published');
    }

    const profile = await (this.prisma as any).businessProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found. Please create a business profile first.');
    }

    return (this.prisma as any).businessProfile.update({
      where: { userId },
      data: {
        templateId: template.id,
      },
      include: {
        template: true,
      },
    });
  }

  async getMyBusinessTheme(userId: string) {
    const profile: any = await (this.prisma as any).businessProfile.findUnique({
      where: { userId },
      include: {
        template: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found. Please create a business profile first.');
    }

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: {
          isDefault: true,
          isPublished: true,
          category: TemplateCategory.BUSINESS,
        },
      });

      if (!template) {
        template = await this.prisma.template.findFirst({
          where: { isDefault: true, isPublished: true },
        });
      }
    }

    const baseConfig = template?.layoutConfig;
    const resolvedLayout = this.resolveLayout(
      baseConfig,
      profile.userCustomConfig,
      TemplateCategory.BUSINESS,
    );

    return {
      template,
      userCustomConfig: profile.userCustomConfig,
      resolvedLayout,
    };
  }

  async updateBusinessCustomConfig(userId: string, dto: UpdateUserThemeDto) {
    const profile: any = await (this.prisma as any).businessProfile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const existingConfig = (profile.userCustomConfig as UserCustomConfig) || {};
    const updatedConfig: UserCustomConfig = {
      theme: {
        ...(existingConfig.theme || {}),
        ...(dto.theme || {}),
      },
      sections: dto.sections ?? existingConfig.sections,
    };

    const updatedProfile: any = await (this.prisma as any).businessProfile.update({
      where: { userId },
      data: {
        userCustomConfig: updatedConfig as any,
      },
      include: { template: true },
    });

    let template = updatedProfile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: {
          isDefault: true,
          isPublished: true,
          category: TemplateCategory.BUSINESS,
        },
      });

      if (!template) {
        template = await this.prisma.template.findFirst({
          where: { isDefault: true, isPublished: true },
        });
      }
    }

    const resolvedLayout = this.resolveLayout(
      template?.layoutConfig,
      updatedConfig,
      TemplateCategory.BUSINESS,
    );

    return {
      businessProfile: updatedProfile,
      userCustomConfig: updatedConfig,
      resolvedLayout,
    };
  }

  async reorderMyBusinessSections(userId: string, sectionIds: string[]) {
    const profile: any = await (this.prisma as any).businessProfile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: {
          isDefault: true,
          isPublished: true,
          category: TemplateCategory.BUSINESS,
        },
      });

      if (!template) {
        template = await this.prisma.template.findFirst({
          where: { isDefault: true, isPublished: true },
        });
      }
    }

    const baseLayout = (template?.layoutConfig as any) || {};
    const baseSections: any[] = baseLayout.sections || [];
    const existingConfig = (profile.userCustomConfig as UserCustomConfig) || {};
    const existingSections = existingConfig.sections || [];

    const existingMap = new Map(existingSections.map((s) => [s.id, s]));
    const baseMap = new Map(baseSections.map((s) => [s.id, s]));

    const orderedSections = sectionIds.map((id) => {
      const override = existingMap.get(id);
      const baseSec = baseMap.get(id);
      return {
        id,
        isVisible: override?.isVisible !== undefined ? override.isVisible : (baseSec?.isVisible ?? true),
        props: {
          ...(baseSec?.props || {}),
          ...(override?.props || {}),
        },
      };
    });

    const updatedConfig: UserCustomConfig = {
      ...existingConfig,
      sections: orderedSections,
    };

    const updatedProfile = await (this.prisma as any).businessProfile.update({
      where: { userId },
      data: {
        userCustomConfig: updatedConfig as any,
      },
    });

    const resolvedLayout = this.resolveLayout(
      baseLayout,
      updatedConfig,
      TemplateCategory.BUSINESS,
    );

    return {
      message: 'Business sections reordered successfully',
      userCustomConfig: updatedConfig,
      resolvedLayout,
    };
  }

  async resetBusinessCustomConfig(userId: string) {
    const profile: any = await (this.prisma as any).businessProfile.findUnique({
      where: { userId },
      include: { template: true },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    await (this.prisma as any).businessProfile.update({
      where: { userId },
      data: {
        userCustomConfig: Prisma.DbNull,
      },
    });

    let template = profile.template;
    if (!template) {
      template = await this.prisma.template.findFirst({
        where: {
          isDefault: true,
          isPublished: true,
          category: TemplateCategory.BUSINESS,
        },
      });

      if (!template) {
        template = await this.prisma.template.findFirst({
          where: { isDefault: true, isPublished: true },
        });
      }
    }

    const resolvedLayout = this.resolveLayout(
      template?.layoutConfig,
      null,
      TemplateCategory.BUSINESS,
    );

    return {
      message: 'Business theme customization reset to template default',
      resolvedLayout,
    };
  }

  // ─── RESOLUTION ENGINE ──────────────────────────────────────────────────────

  /**
   * Menggabungkan base template layout dengan kustomisasi pribadi user
   */
  resolveLayout(
    baseConfig?: any,
    userOverride?: any,
    category: TemplateCategory = TemplateCategory.DEVELOPER,
  ): LayoutConfig {
    const fallbackDeveloper: LayoutConfig = {
      theme: {
        fontFamily: 'Inter',
        primaryColor: '#3B82F6',
        backgroundColor: '#0F172A',
        surfaceColor: '#1E293B',
        textColor: '#F8FAFC',
        borderRadius: '12px',
        darkMode: true,
      },
      sections: [
        {
          id: 'hero-default',
          type: 'HERO_PROFILE',
          variant: 'MODERN_SPLIT',
          isVisible: true,
          props: { showBanner: true, avatarShape: 'rounded' },
        },
        {
          id: 'skills-default',
          type: 'SKILLS_LIST',
          variant: 'PILL_TAGS',
          isVisible: true,
          props: {},
        },
        {
          id: 'projects-default',
          type: 'PROJECT_LIST',
          variant: 'BENTO_GRID_3COL',
          isVisible: true,
          props: { limit: 6 },
        },
        {
          id: 'experiences-default',
          type: 'EXPERIENCE_TIMELINE',
          variant: 'VERTICAL_TIMELINE',
          isVisible: true,
          props: {},
        },
      ],
    };

    const fallbackBusiness: LayoutConfig = {
      theme: {
        fontFamily: 'Inter',
        primaryColor: '#2563EB',
        backgroundColor: '#0F172A',
        surfaceColor: '#1E293B',
        textColor: '#F8FAFC',
        borderRadius: '12px',
        darkMode: true,
      },
      sections: [
        {
          id: 'hero-business-default',
          type: 'HERO_PROFILE',
          variant: 'BUSINESS_HERO',
          isVisible: true,
          props: { showBanner: true, showLogo: true },
        },
        {
          id: 'about-business-default',
          type: 'ABOUT_ME',
          variant: 'COMPANY_OVERVIEW',
          isVisible: true,
          props: {},
        },
        {
          id: 'services-business-default',
          type: 'SERVICES_GRID',
          variant: 'CARD_GRID_3COL',
          isVisible: true,
          props: { showPricing: true },
        },
        {
          id: 'projects-business-default',
          type: 'PROJECT_LIST',
          variant: 'PORTFOLIO_SHOWCASE',
          isVisible: true,
          props: { limit: 6 },
        },
        {
          id: 'contact-business-default',
          type: 'CONTACT_SECTION',
          variant: 'BUSINESS_CONTACT_CARD',
          isVisible: true,
          props: {},
        },
      ],
    };

    const fallbackBase =
      category === TemplateCategory.BUSINESS
        ? fallbackBusiness
        : fallbackDeveloper;

    const base: LayoutConfig = baseConfig || fallbackBase;

    if (!userOverride) {
      return base;
    }

    const resolvedTheme = {
      ...base.theme,
      ...(userOverride.theme || {}),
    };

    let resolvedSections: SectionBlock[] = [];

    if (
      userOverride.sections &&
      Array.isArray(userOverride.sections) &&
      userOverride.sections.length > 0
    ) {
      const baseSectionsMap = new Map(
        (base.sections || []).map((s) => [s.id, s]),
      );

      for (const overrideSection of userOverride.sections) {
        const baseSection = baseSectionsMap.get(overrideSection.id);
        if (baseSection) {
          resolvedSections.push({
            ...baseSection,
            title: overrideSection.title ?? baseSection.title,
            variant: overrideSection.variant ?? baseSection.variant,
            isVisible:
              overrideSection.isVisible !== undefined
                ? overrideSection.isVisible
                : baseSection.isVisible,
            props: {
              ...(baseSection.props || {}),
              ...(overrideSection.props || {}),
            },
          });
          baseSectionsMap.delete(overrideSection.id);
        } else {
          resolvedSections.push({
            id: overrideSection.id,
            type: overrideSection.type || 'CUSTOM_SECTION',
            title: overrideSection.title,
            variant: overrideSection.variant,
            isVisible:
              overrideSection.isVisible !== undefined
                ? overrideSection.isVisible
                : true,
            props: overrideSection.props || {},
          });
        }
      }

      // Sisa base section yang belum ada di override (agar tidak hilang)
      for (const remainingBaseSection of baseSectionsMap.values()) {
        resolvedSections.push(remainingBaseSection);
      }
    } else {
      resolvedSections = base.sections || [];
    }

    return {
      theme: resolvedTheme,
      sections: resolvedSections,
    };
  }
}
