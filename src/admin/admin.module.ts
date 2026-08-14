import { Module } from '@nestjs/common';
import { ExperiencesModule } from 'src/experiences/experiences.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { AdminExperiencesController } from './admin-experiences.controller';
import { AdminProjectsController } from './admin-project.controller';

@Module({
    imports: [ExperiencesModule, ProjectsModule],
    controllers: [
        AdminExperiencesController,
        AdminProjectsController,
    ],
})
export class AdminModule { }