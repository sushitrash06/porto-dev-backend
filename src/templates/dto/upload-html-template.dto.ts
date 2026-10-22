import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateCategory } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UploadHtmlTemplateDto {
  @ApiProperty({ example: 'creative-developer-html' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Creative Developer HTML Theme' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Handcrafted HTML + CSS layout with animated hero and project showcase' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TemplateCategory, default: TemplateCategory.DEVELOPER })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Raw HTML string if not uploading a file' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: 'Raw CSS string if not uploading a file' })
  @IsOptional()
  @IsString()
  cssContent?: string;
}

export class UpdateHtmlTemplateDto {
  @ApiPropertyOptional({ example: 'creative-developer-html' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Creative Developer HTML Theme' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Raw HTML string if not uploading a file' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: 'Raw CSS string if not uploading a file' })
  @IsOptional()
  @IsString()
  cssContent?: string;
}
