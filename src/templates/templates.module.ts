import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { AdminTemplatesController } from './admin-templates.controller';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [TemplatesController, AdminTemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
