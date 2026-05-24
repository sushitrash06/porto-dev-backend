import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';

import { ProfilesService } from './profiles.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';


@Controller('profiles')
export class ProfilesController {
    constructor(
        private readonly profilesService: ProfilesService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return this.profilesService.getMyProfile(
            user.userId,
        );
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

    @Get(':userId')
    getPublic(
        @Param('userId') userId: string,
    ) {
        return this.profilesService.getPublicProfile(
            userId,
        );
    }
}