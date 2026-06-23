import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { BusinessProjectsService } from './business-projects.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/detectors/roles.decorator';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateBusinessProjectDto } from 'src/auth/dto/create-business-project.dto';
import { UpdateBusinessProjectDto } from 'src/auth/dto/update-business-project.dto';

@ApiTags('Business Projects')
@Controller('business-projects')
export class BusinessProjectsController {
    constructor(
        private readonly businessProjectsService: BusinessProjectsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new business project' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Post()
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateBusinessProjectDto,
    ) {
        return this.businessProjectsService.create(
            user.userId,
            dto,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all business projects belonging to the logged-in user' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.businessProjectsService.findMine(
            user.userId,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific business project detail owned by the logged-in user' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Get('me/:id')
    findOne(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.businessProjectsService.findOne(
            user.userId,
            id,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload project thumbnail image' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Post(':id/thumbnail')
    @UseInterceptors(FileInterceptor('file'))
    async uploadThumbnail(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        const imageUrl = (uploadedImage as any).secure_url;

        return this.businessProjectsService.updateThumbnail(
            user.userId,
            id,
            imageUrl,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload a detail image to the business project' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Post(':id/images')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        const imageUrl = (uploadedImage as any).secure_url;

        return this.businessProjectsService.addImage(
            user.userId,
            id,
            imageUrl,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a detail image from the business project' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Delete(':id/images')
    async removeImage(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body('imageUrl') imageUrl: string,
    ) {
        await this.cloudinaryService.deleteImageByUrl(
            imageUrl,
        );

        return this.businessProjectsService.removeImage(
            user.userId,
            id,
            imageUrl,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing business project' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBusinessProjectDto,
    ) {
        return this.businessProjectsService.update(
            user.userId,
            id,
            dto,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a business project' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.businessProjectsService.remove(
            user.userId,
            id,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiOperation({ summary: 'Get all public business projects for a specific user' })
    @Get('public/:userId')
    findPublicByUser(@Param('userId') userId: string) {
        return this.businessProjectsService.findPublicByUser(
            userId,
        );
    }

    @ApiOperation({ summary: 'Get details of a public business project' })
    @Get('public/:userId/:id')
    findOnePublic(
        @Param('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.businessProjectsService.findOnePublic(
            userId,
            id,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Convert a personal project into a business case study' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('BUSINESS', 'SUPER_ADMIN')
    @Post('import-personal/:personalProjectId')
    migratePersonalProject(
        @CurrentUser() user: any,
        @Param('personalProjectId') personalProjectId: string,
        @Query('deleteOriginal') deleteOriginal?: string,
    ) {
        return this.businessProjectsService.migratePersonalProject(
            user.userId,
            personalProjectId,
            deleteOriginal === 'true',
        );
    }
}
