import {
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    headline?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsArray()
    services?: string[];

    @IsOptional()
    @IsString()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}