import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSectionsDto {
  @ApiProperty({
    description: 'Array of section IDs in the desired order',
    example: ['sec-projects-3', 'sec-hero-1', 'sec-skills-2', 'sec-experiences-4', 'sec-contact-5'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sectionIds: string[];
}
