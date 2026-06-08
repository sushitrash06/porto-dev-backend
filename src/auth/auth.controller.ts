import {
    Body,
    Controller,
    Post,
    UseGuards,
    Get,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './detectors/create-user.decorator';
import { Roles } from './detectors/roles.decorator';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    changePassword(
        @CurrentUser() user: any,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(
            user.userId,
            dto,
        );
    }

    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('SUPER_ADMIN')
    @Get('admin')
    adminOnly() {
        return {
            message:
                'WELCOME SUPER ADMIN',
        };
    }
}