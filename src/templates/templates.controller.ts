import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TemplateCategory } from '@prisma/client';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';

import { TemplatesService } from './templates.service';
import { ApplyTemplateDto } from './dto/apply-template.dto';
import { UpdateUserThemeDto } from './dto/update-user-theme.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';

@ApiTags('Templates (Public & User)')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @ApiOperation({ summary: 'Get all published templates for template picker' })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  @Get()
  findAllPublished(@Query('category') category?: TemplateCategory) {
    return this.templatesService.findAllPublished(category);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active template, custom config, and resolved layout' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyTheme(@CurrentUser() user: any) {
    return this.templatesService.getMyTheme(user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply selected template to current user profile' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/apply')
  applyTemplate(
    @CurrentUser() user: any,
    @Body() dto: ApplyTemplateDto,
  ) {
    return this.templatesService.applyTemplateToProfile(user.userId, dto.templateId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom theme overrides (colors, visibility) for current user' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/theme-config')
  updateCustomTheme(
    @CurrentUser() user: any,
    @Body() dto: UpdateUserThemeDto,
  ) {
    return this.templatesService.updateUserCustomConfig(user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder sections for current user portfolio (Drag & Drop)' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/reorder-sections')
  reorderSections(
    @CurrentUser() user: any,
    @Body() dto: ReorderSectionsDto,
  ) {
    return this.templatesService.reorderMySections(user.userId, dto.sectionIds);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset current user customizations back to base template defaults' })
  @UseGuards(JwtAuthGuard)
  @Post('me/reset')
  resetCustomTheme(@CurrentUser() user: any) {
    return this.templatesService.resetUserCustomConfig(user.userId);
  }

  @ApiOperation({ summary: 'Get preview detail of a published template by id or slug' })
  @Get(':id')
  findOnePublished(@Param('id') id: string) {
    return this.templatesService.findOnePublished(id);
  }
}
