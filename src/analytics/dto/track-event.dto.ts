import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsEventType } from '@prisma/client';

export class TrackEventDto {
  @ApiProperty({ description: 'The user ID owning the portfolio/project/social being viewed' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: AnalyticsEventType, description: 'Type of analytics event' })
  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @ApiPropertyOptional({ description: 'Target identifier (e.g. project ID or social name like "whatsapp", "github")' })
  @IsString()
  @IsOptional()
  targetId?: string;

  @ApiPropertyOptional({ description: 'Target readable title (e.g. project title, "GitHub Profile", "WhatsApp Direct")' })
  @IsString()
  @IsOptional()
  targetTitle?: string;

  @ApiPropertyOptional({ description: 'HTTP referrer url or source' })
  @IsString()
  @IsOptional()
  referrer?: string;
}
