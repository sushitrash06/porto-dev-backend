import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSingleSectionDto {
  @ApiPropertyOptional({ description: 'Custom section title override' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Layout variant style for this section' })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiPropertyOptional({ description: 'Visibility toggle of this section' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Custom props content data for this section (testimonials, stats, faqs, etc.)',
  })
  @IsOptional()
  @IsObject()
  props?: Record<string, any>;
}

export class UpdateUserThemeDto {
  @ApiPropertyOptional({
    description: 'Custom theme overrides (colors, fonts, etc.)',
    example: { primaryColor: '#2563EB', darkMode: true },
  })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Section visibility, variants, and props overrides',
    example: [{ id: 'sec-contact', isVisible: false }],
  })
  @IsOptional()
  sections?: Array<{
    id: string;
    type?: string;
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }>;
}

