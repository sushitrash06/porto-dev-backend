import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { TemplateCategory } from '@prisma/client';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';

import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UploadHtmlTemplateDto, UpdateHtmlTemplateDto } from './dto/upload-html-template.dto';

@ApiTags('Admin/Templates (Theme Builder)')
@ApiBearerAuth()
@Controller('admin/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminTemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @ApiOperation({ summary: 'Create new template from drag-and-drop builder' })
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Create new template by uploading HTML and CSS files or raw content' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', example: 'retro-portfolio' },
        name: { type: 'string', example: 'Retro 90s Portfolio' },
        description: { type: 'string', example: 'Old-school cyberpunk HTML layout' },
        category: { type: 'string', enum: Object.values(TemplateCategory) },
        isPublished: { type: 'boolean', default: false },
        htmlFile: { type: 'string', format: 'binary' },
        cssFile: { type: 'string', format: 'binary' },
        htmlContent: { type: 'string' },
        cssContent: { type: 'string' },
      },
      required: ['slug', 'name'],
    },
  })
  @Post('upload-html')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'htmlFile', maxCount: 1 },
      { name: 'cssFile', maxCount: 1 },
    ]),
  )
  uploadHtmlTemplate(
    @CurrentUser() user: any,
    @Body() dto: UploadHtmlTemplateDto,
    @UploadedFiles()
    files?: { htmlFile?: Express.Multer.File[]; cssFile?: Express.Multer.File[] },
  ) {
    return this.templatesService.createFromHtml(user.userId, dto, files);
  }

  @ApiOperation({ summary: 'Update custom HTML and CSS template content or files' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch(':id/upload-html')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'htmlFile', maxCount: 1 },
      { name: 'cssFile', maxCount: 1 },
    ]),
  )
  updateHtmlTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateHtmlTemplateDto,
    @UploadedFiles()
    files?: { htmlFile?: Express.Multer.File[]; cssFile?: Express.Multer.File[] },
  ) {
    return this.templatesService.updateHtmlTemplate(id, dto, files);
  }

  @ApiOperation({ summary: 'Get all templates for admin (drafts, published, filterable)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  @ApiQuery({ name: 'isPublished', type: Boolean, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: TemplateCategory,
    @Query('isPublished') isPublished?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.templatesService.findAllAdmin({
      search,
      category,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @ApiOperation({ summary: 'Get single template detail for Theme Builder canvas' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOneAdmin(id);
  }

  @ApiOperation({ summary: 'Update template (layout config, sections, theme styles)' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Publish or unpublish template' })
  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    return this.templatesService.publish(id, isPublished);
  }

  @ApiOperation({ summary: 'Clone existing template as base for a new one' })
  @Post(':id/clone')
  clone(@CurrentUser() user: any, @Param('id') id: string) {
    return this.templatesService.clone(id, user.userId);
  }

  @ApiOperation({ summary: 'Upload preview thumbnail for template' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.templatesService.uploadThumbnail(id, file);
  }

  @ApiOperation({ summary: 'Delete template' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }
}
