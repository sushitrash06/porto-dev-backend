import { Module } from '@nestjs/common';

import { BusinessProjectsController } from './business-projects.controller';
import { BusinessProjectsService } from './business-projects.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [BusinessProjectsController],
    providers: [BusinessProjectsService],
    exports: [BusinessProjectsService],
})
export class BusinessProjectsModule { }
