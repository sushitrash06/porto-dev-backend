import { Module } from '@nestjs/common';

import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule { }