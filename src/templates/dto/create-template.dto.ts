import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateCategory } from '@prisma/client';
import { LayoutConfigDto } from './layout-config.dto';

export class CreateTemplateDto {
  @ApiProperty({ example: 'modern-dark' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Modern Dark Portfolio' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Clean, dark-mode portfolio template for developers' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../preview.png' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ enum: TemplateCategory, default: TemplateCategory.DEVELOPER })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ type: LayoutConfigDto })
  @ValidateNested()
  @Type(() => LayoutConfigDto)
  layoutConfig: LayoutConfigDto;
}
