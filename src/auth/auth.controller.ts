import {
    Body,
    Controller,
    Post,
    UseGuards,
    Get,
} from '@nestjs/common';
import { Roles } from './detectors/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './detectors/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN')
    @Get('admin')
    adminOnly() {
        return {
            message:
                'WELCOME SUPER ADMIN',
        };
    }

}