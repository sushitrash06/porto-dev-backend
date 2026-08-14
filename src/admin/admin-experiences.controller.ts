import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ExperiencesService } from 'src/experiences/experiences.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';

@ApiTags('Admin/Experiences')
@ApiBearerAuth()
@Controller('admin/experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminExperiencesController {
    constructor(
        private readonly experiencesService: ExperiencesService,
    ) { }

    @ApiOperation({ summary: 'Get all experiences with pagination and filters (Admin only)' })
    @Get()
    findAll(
        @Query('userId') userId?: string,
        @Query('company') company?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.experiencesService.findAllAdmin({
            userId,
            company,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
}