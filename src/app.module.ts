import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { AdminModule } from './admin/admin.module';
import { ProjectsModule } from './projects/projects.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { BusinessProfilesModule } from './business-profiles/business-profiles.module';
import { BusinessServicesModule } from './business-services/business-services.module';
import { BusinessProjectsModule } from './business-projects/business-projects.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProfilesModule,
    CloudinaryModule,
    ExperiencesModule,
    AdminModule,
    ProjectsModule,
    PortfolioModule,
    BusinessProfilesModule,
    BusinessServicesModule,
    BusinessProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }