import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import { ProjectType } from '@prisma/client';

export class CreateProjectDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    experienceId?: string;

    @IsOptional()
    @IsEnum(ProjectType)
    type?: ProjectType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsArray()
    images?: string[];

    @IsOptional()
    @IsArray()
    techStacks?: string[];

    @IsOptional()
    @IsString()
    projectUrl?: string;

    @IsOptional()
    @IsString()
    githubUrl?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}