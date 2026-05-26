import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProfilesService } from './profiles.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
    constructor(
        private readonly profilesService: ProfilesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return this.profilesService.getMyProfile(user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(
        @CurrentUser() user: any,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.profilesService.updateProfile(
            user.userId,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const currentProfile =
            await this.profilesService.getMyProfile(user.userId);

        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        await this.cloudinaryService.deleteImageByUrl(
            currentProfile?.profileImage,
        );

        const imageUrl = (uploadedImage as any).secure_url;

        return this.profilesService.updateProfileImage(
            user.userId,
            imageUrl,
        );
    }

    @Get(':userId')
    getPublic(@Param('userId') userId: string) {
        return this.profilesService.getPublicProfile(userId);
    }
}