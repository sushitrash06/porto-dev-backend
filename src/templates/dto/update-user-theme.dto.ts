import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserThemeDto {
  @ApiPropertyOptional({
    description: 'Custom theme overrides (colors, fonts, etc.)',
    example: { primaryColor: '#2563EB', darkMode: true },
  })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Section visibility and props overrides',
    example: [{ id: 'sec-contact', isVisible: false }],
  })
  @IsOptional()
  sections?: Array<{
    id: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }>;
}
