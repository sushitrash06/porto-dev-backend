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

import { UsersService } from './users.service';


import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
    @Post()
    create(
        @Body() dto: CreateUserDto,
    ) {
        return this.usersService.create(dto);
    }

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
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

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto);
    }

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}