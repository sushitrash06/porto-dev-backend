import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyTemplateDto {
  @ApiProperty({ description: 'Template ID or slug to apply to user profile', example: 'uuid-or-slug' })
  @IsString()
  @IsNotEmpty()
  templateId: string;
}
