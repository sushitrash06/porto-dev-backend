import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TemplatesModule } from 'src/templates/templates.module';

@Module({
  imports: [TemplatesModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule { }