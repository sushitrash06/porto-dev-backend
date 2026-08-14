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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ExperiencesService } from './experiences.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateExperienceDto } from 'src/auth/dto/create-experience.dto';
import { UpdateExperienceDto } from 'src/auth/dto/update-experience.dto';

@ApiTags('Experiences')
@Controller('experiences')
export class ExperiencesController {
    constructor(
        private readonly experiencesService: ExperiencesService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new personal experience record' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all personal experience records of logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.experiencesService.findMine(
            user.userId,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific personal experience record of logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me/:id')
    findOneMine(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.experiencesService.findOneMine(
            user.userId,
            id,
            user.role === 'ADMIN',
        );
    }

    @ApiOperation({ summary: 'Get all public experiences for a user' })
    @Get('public/:userId')
    findPublicByUser(
        @Param('userId') userId: string,
    ) {
        return this.experiencesService.findPublicByUser(
            userId,
        );
    }

    @ApiOperation({ summary: 'Get details of a public experience record' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a personal experience record' })
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
            user.role === 'ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a personal experience record' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.experiencesService.remove(
            user.userId,
            id,
            user.role === 'ADMIN',
        );
    }
}