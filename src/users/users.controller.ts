import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { UsersService } from './users.service';


import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';


@ApiTags('Admin/Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Post()
    create(
        @Body() dto: CreateUserDto,
    ) {
        return this.usersService.create(dto);
    }

    @ApiOperation({ summary: 'Get all users with pagination and search (Admin only)' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.usersService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search,
        });
    }

    @ApiOperation({ summary: 'Get specific user details by ID (Admin only)' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @ApiOperation({ summary: 'Update user details (Admin only)' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete user account (Admin only)' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}