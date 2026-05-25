import {
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateExperienceDto {
    @IsString()
    company: string;

    @IsString()
    position: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    companyLogo?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}