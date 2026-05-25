import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-projects.dto';

export class UpdateProjectDto extends PartialType(
    CreateProjectDto,
) { }