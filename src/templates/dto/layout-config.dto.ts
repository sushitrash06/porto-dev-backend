import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThemeTokensDto {
  @ApiProperty({ example: 'Plus Jakarta Sans' })
  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @ApiProperty({ example: '#6366F1' })
  @IsString()
  @IsNotEmpty()
  primaryColor: string;

  @ApiPropertyOptional({ example: '#EC4899' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({ example: '#0F172A' })
  @IsString()
  @IsNotEmpty()
  backgroundColor: string;

  @ApiPropertyOptional({ example: '#1E293B' })
  @IsOptional()
  @IsString()
  surfaceColor?: string;

  @ApiPropertyOptional({ example: '#F8FAFC', description: 'Primary heading text color' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ example: '#94A3B8', description: 'Secondary body and muted text color' })
  @IsOptional()
  @IsString()
  textSecondaryColor?: string;

  @ApiPropertyOptional({ example: '16px' })
  @IsOptional()
  @IsString()
  borderRadius?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}

export class SectionBlockDto {
  @ApiProperty({ example: 'sec-hero-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'HERO_PROFILE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 'About Me' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'MODERN_SPLIT' })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isVisible: boolean;

  @ApiPropertyOptional({ example: { showBanner: true, avatarShape: 'rounded' } })
  @IsOptional()
  @IsObject()
  props?: Record<string, any>;
}

export class LayoutConfigDto {
  @ApiPropertyOptional({ enum: ['BUILDER', 'CUSTOM_HTML'], default: 'BUILDER' })
  @IsOptional()
  @IsString()
  templateType?: 'BUILDER' | 'CUSTOM_HTML';

  @ApiPropertyOptional({ description: 'Raw custom HTML template string with placeholders' })
  @IsOptional()
  @IsString()
  customHtml?: string;

  @ApiPropertyOptional({ description: 'Custom CSS stylesheet string' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ type: ThemeTokensDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeTokensDto)
  theme?: ThemeTokensDto;

  @ApiPropertyOptional({ type: [SectionBlockDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionBlockDto)
  sections?: SectionBlockDto[];
}
