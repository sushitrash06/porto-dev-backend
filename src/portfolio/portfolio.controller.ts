import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';

@ApiTags('Portfolio (Public)')
@Controller('portfolio')
export class PortfolioController {
    constructor(
        private readonly portfolioService: PortfolioService,
    ) { }

    @ApiOperation({ summary: 'Get full public portfolio (profile, experiences, and projects) for a user' })
    @Get(':userId')
    getPublicPortfolio(@Param('userId') userId: string) {
        return this.portfolioService.getPublicPortfolio(userId);
    }
}