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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProfilesService } from './profiles.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateProfileDto } from 'src/auth/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
    constructor(
        private readonly profilesService: ProfilesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create current user personal profile' })
    @UseGuards(JwtAuthGuard)
    @Post()
    createProfile(
        @CurrentUser() user: any,
        @Body() dto: CreateProfileDto,
    ) {
        return this.profilesService.createProfile(user.userId, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user personal profile' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return this.profilesService.getMyProfile(user.userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user personal profile' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload profile image' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload profile banner image' })
    @UseGuards(JwtAuthGuard)
    @Post('me/banner')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileBanner(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const currentProfile =
            await this.profilesService.getMyProfile(user.userId);

        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        await this.cloudinaryService.deleteImageByUrl(
            currentProfile?.bannerImage,
        );

        const imageUrl = (uploadedImage as any).secure_url;

        return this.profilesService.updateProfileBanner(
            user.userId,
            imageUrl,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload profile CV file' })
    @UseGuards(JwtAuthGuard)
    @Post('me/cv')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileCv(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const currentProfile =
            await this.profilesService.getMyProfile(user.userId);

        const uploadedFile =
            await this.cloudinaryService.uploadFile(file, 'profiles', 'raw');

        await this.cloudinaryService.deleteFileByUrl(
            currentProfile?.cvUrl,
            'raw',
        );

        const fileUrl = (uploadedFile as any).secure_url;

        return this.profilesService.updateProfileCv(
            user.userId,
            fileUrl,
        );
    }

    @ApiOperation({ summary: 'Get a public personal profile by userId' })
    @Get(':userId')
    getPublic(@Param('userId') userId: string) {
        return this.profilesService.getPublicProfile(userId);
    }
}