import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BusinessProjectType } from '@prisma/client';

export class CreateBusinessProjectDto {
    @ApiProperty({ example: 'E-commerce Platform Project' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Jakarta, Indonesia' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: 2026 })
    @IsOptional()
    @IsInt()
    year?: number;

    @ApiPropertyOptional({ example: 'A highly scalable e-commerce platform.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: BusinessProjectType, example: 'SOFTWARE_DEVELOPMENT' })
    @IsOptional()
    @IsEnum(BusinessProjectType)
    projectType?: BusinessProjectType;

    @ApiPropertyOptional({ example: 'PT Client Name' })
    @IsOptional()
    @IsString()
    clientName?: string;

    @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/v1/projects/thumb.jpg' })
    @IsOptional()
    @IsString()
    thumbnail?: string;

    @ApiPropertyOptional({ type: [String], example: ['https://res.cloudinary.com/demo/image/upload/v1/projects/img1.jpg'] })
    @IsOptional()
    @IsArray()
    images?: string[];

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
