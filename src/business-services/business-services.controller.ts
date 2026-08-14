import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { BusinessServicesService } from './business-services.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateBusinessServiceDto } from 'src/auth/dto/create-business-service.dto';
import { UpdateBusinessServiceDto } from 'src/auth/dto/update-business-service.dto';

@ApiTags('Business Services')
@Controller('business-services')
export class BusinessServicesController {
    constructor(
        private readonly businessServicesService: BusinessServicesService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new business service' })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateBusinessServiceDto,
    ) {
        return this.businessServicesService.create(
            user.userId,
            dto,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all business services belonging to the logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.businessServicesService.findMine(
            user.userId,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific business service detail owned by the logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me/:id')
    findOne(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.businessServicesService.findOne(
            user.userId,
            id,
            user.role === 'ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing business service' })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBusinessServiceDto,
    ) {
        return this.businessServicesService.update(
            user.userId,
            id,
            dto,
            user.role === 'ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a business service' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.businessServicesService.remove(
            user.userId,
            id,
            user.role === 'ADMIN',
        );
    }

    @ApiOperation({ summary: 'Get all public business services for a specific user' })
    @Get('public/:userId')
    findPublicByUser(@Param('userId') userId: string) {
        return this.businessServicesService.findPublicByUser(
            userId,
        );
    }

    @ApiOperation({ summary: 'Get details of a public business service' })
    @Get('public/:userId/:id')
    findOnePublic(
        @Param('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.businessServicesService.findOnePublic(
            userId,
            id,
        );
    }
}
