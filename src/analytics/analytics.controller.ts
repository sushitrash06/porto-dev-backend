import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Public tracking endpoint for portfolio/project/social events' })
  @HttpCode(HttpStatus.OK)
  @Post('track')
  trackEvent(@Body() dto: TrackEventDto, @Req() req: Request) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers['user-agent'];

    return this.analyticsService.trackEvent(dto, rawIp, userAgent);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get private user dashboard analytics (views, projects, social clicks)' })
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboardAnalytics(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getDashboardAnalytics(user.userId, numDays);
  }
}
