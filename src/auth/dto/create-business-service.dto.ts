import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessServiceDto {
    @ApiProperty({ example: 'Mobile App Development' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Custom mobile application built with Flutter or React Native.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 15000000 })
    @IsOptional()
    @IsInt()
    priceStartFrom?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
