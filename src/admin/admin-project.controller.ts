import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ProjectsService } from 'src/projects/projects.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';

@ApiTags('Admin/Projects')
@ApiBearerAuth()
@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
    ) { }

    @ApiOperation({ summary: 'Get all projects with pagination and filters (Admin only)' })
    @Get()
    findAll(
        @Query('userId') userId?: string,
        @Query('type') type?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.projectsService.findAllAdmin({
            userId,
            type,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
}