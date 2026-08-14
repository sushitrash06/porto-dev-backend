import {
    Body,
    Controller,
    Post,
    UseGuards,
    Get,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './detectors/create-user.decorator';
import { Roles } from './detectors/roles.decorator';


import { EmailService } from 'src/email/email.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a test email to the authenticated user' })
    @UseGuards(JwtAuthGuard)
    @Get('test-email')
    async testEmail(@CurrentUser() user: any) {
        await this.emailService.sendTestEmail(user.email);
        return { message: 'Test email sent successfully.' };
    }

    @ApiOperation({ summary: 'Register a new user account' })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @ApiOperation({ summary: 'Verify user email address' })
    @ApiQuery({ name: 'token', required: true, description: 'Verification token sent to email' })
    @Get('verify-email')
    verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @ApiOperation({ summary: 'Resend verification email' })
    @Post('resend-verification')
    resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    @ApiOperation({ summary: 'Login user' })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current logged in user details' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return this.authService.getMe(user.userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin only access check' })
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('ADMIN')
    @Get('admin')
    adminOnly() {
        return {
            message:
                'WELCOME SUPER ADMIN',
        };
    }
}