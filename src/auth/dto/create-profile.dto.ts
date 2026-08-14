import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    fullName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    headline?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    services?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    contactEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
