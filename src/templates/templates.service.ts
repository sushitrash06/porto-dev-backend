import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TemplateCategory } from '@prisma/client';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpdateUserThemeDto } from './dto/update-user-theme.dto';
import { LayoutConfig, UserCustomConfig } from './interfaces/layout-config.interface';

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

  async updateUserCustomConfig(userId: string, dto: UpdateUserThemeDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
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

    return this.prisma.profile.update({
      where: { userId },
      data: {
        userCustomConfig: updatedConfig as any,
      },
    });
  }

  // ─── RESOLUTION ENGINE ──────────────────────────────────────────────────────

  /**
   * Menggabungkan base template layout dengan kustomisasi pribadi user
   */
  resolveLayout(baseConfig?: any, userOverride?: any): LayoutConfig {
    const fallbackBase: LayoutConfig = {
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

    const base: LayoutConfig = baseConfig || fallbackBase;

    if (!userOverride) {
      return base;
    }

    const resolvedTheme = {
      ...base.theme,
      ...(userOverride.theme || {}),
    };

    const resolvedSections = (base.sections || []).map((section) => {
      const overrideSection = (userOverride.sections || []).find(
        (s: any) => s.id === section.id,
      );

      if (!overrideSection) {
        return section;
      }

      return {
        ...section,
        isVisible:
          overrideSection.isVisible !== undefined
            ? overrideSection.isVisible
            : section.isVisible,
        props: {
          ...(section.props || {}),
          ...(overrideSection.props || {}),
        },
      };
    });

    return {
      theme: resolvedTheme,
      sections: resolvedSections,
    };
  }
}
