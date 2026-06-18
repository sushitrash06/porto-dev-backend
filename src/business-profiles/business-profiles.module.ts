import { Module } from '@nestjs/common';

import { BusinessProfilesController } from './business-profiles.controller';
import { BusinessProfilesService } from './business-profiles.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [BusinessProfilesController],
    providers: [BusinessProfilesService],
    exports: [BusinessProfilesService],
})
export class BusinessProfilesModule { }
