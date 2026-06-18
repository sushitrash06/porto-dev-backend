import { PartialType } from '@nestjs/swagger';
import { CreateBusinessProjectDto } from './create-business-project.dto';

export class UpdateBusinessProjectDto extends PartialType(
    CreateBusinessProjectDto,
) { }
