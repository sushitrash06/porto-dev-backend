import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';


import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';


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
    findAll() {
        return this.usersService.findAll();
    }
}