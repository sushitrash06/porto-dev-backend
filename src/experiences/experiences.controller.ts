import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { ExperiencesService } from './experiences.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateExperienceDto } from 'src/auth/dto/create-experience.dto';
import { UpdateExperienceDto } from 'src/auth/dto/update-experience.dto';

@Controller('experiences')
export class ExperiencesController {
    constructor(
        private readonly experiencesService: ExperiencesService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateExperienceDto,
    ) {
        return this.experiencesService.create(
            user.userId,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.experiencesService.findMine(
            user.userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/:id')
    findOneMine(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.experiencesService.findOneMine(
            user.userId,
            id,
        );
    }

    @Get('public/:userId')
    findPublicByUser(
        @Param('userId') userId: string,
    ) {
        return this.experiencesService.findPublicByUser(
            userId,
        );
    }

    @Get('public/:userId/:id')
    findOnePublic(
        @Param('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.experiencesService.findOnePublic(
            userId,
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateExperienceDto,
    ) {
        return this.experiencesService.update(
            user.userId,
            id,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.experiencesService.remove(
            user.userId,
            id,
        );
    }
}