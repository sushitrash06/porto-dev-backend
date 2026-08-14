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

import { BusinessProfilesService } from './business-profiles.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateBusinessProfileDto } from 'src/auth/dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from 'src/auth/dto/update-business-profile.dto';

@ApiTags('Business Profiles')
@Controller('business-profiles')
export class BusinessProfilesController {
    constructor(
        private readonly businessProfilesService: BusinessProfilesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user business profile' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return this.businessProfilesService.getMyProfile(
            user.userId,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create current user business profile' })
    @UseGuards(JwtAuthGuard)
    @Post()
    createProfile(
        @CurrentUser() user: any,
        @Body() dto: CreateBusinessProfileDto,
    ) {
        return this.businessProfilesService.createProfile(user.userId, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user business profile' })
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(
        @CurrentUser() user: any,
        @Body() dto: UpdateBusinessProfileDto,
    ) {
        return this.businessProfilesService.updateProfile(
            user.userId,
            dto,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload business logo image' })
    @UseGuards(JwtAuthGuard)
    @Post('me/logo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadLogo(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const currentProfile =
            await this.businessProfilesService.getMyProfile(
                user.userId,
            );

        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        if (currentProfile?.logo) {
            await this.cloudinaryService.deleteImageByUrl(
                currentProfile.logo,
            );
        }

        const imageUrl = (uploadedImage as any).secure_url;

        return this.businessProfilesService.updateLogo(
            user.userId,
            imageUrl,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload business banner image' })
    @UseGuards(JwtAuthGuard)
    @Post('me/banner')
    @UseInterceptors(FileInterceptor('file'))
    async uploadBanner(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const currentProfile =
            await this.businessProfilesService.getMyProfile(
                user.userId,
            );

        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        if (currentProfile?.bannerImage) {
            await this.cloudinaryService.deleteImageByUrl(
                currentProfile.bannerImage,
            );
        }

        const imageUrl = (uploadedImage as any).secure_url;

        return this.businessProfilesService.updateBanner(
            user.userId,
            imageUrl,
        );
    }

    @ApiOperation({ summary: 'Get a public business profile by userId' })
    @Get(':userId')
    getPublic(@Param('userId') userId: string) {
        return this.businessProfilesService.getPublicProfile(
            userId,
        );
    }
}
