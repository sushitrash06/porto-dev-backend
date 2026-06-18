import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessProfileDto {
    @ApiProperty({ example: 'My Business Name' })
    @IsString()
    businessName: string;

    @ApiPropertyOptional({ example: 'A brief description of my business' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'contact@mybusiness.com' })
    @IsOptional()
    @IsString()
    contactEmail?: string;

    @ApiPropertyOptional({ example: '+628123456789' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({ example: 'Jakarta, Indonesia' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: 'https://mybusiness.com' })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
