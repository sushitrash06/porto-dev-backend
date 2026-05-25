import { Module } from '@nestjs/common';

import { ExperiencesModule } from 'src/experiences/experiences.module';
import { AdminExperiencesController } from './admin-experiences.contoller';

@Module({
    imports: [ExperiencesModule],
    controllers: [AdminExperiencesController],
})
export class AdminModule { }