import { Module } from '@nestjs/common';

import { BusinessProfilesController } from './business-profiles.controller';
import { BusinessProfilesService } from './business-profiles.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TemplatesModule } from 'src/templates/templates.module';

@Module({
    imports: [CloudinaryModule, TemplatesModule],
    controllers: [BusinessProfilesController],
    providers: [BusinessProfilesService],
    exports: [BusinessProfilesService],
})
export class BusinessProfilesModule { }
