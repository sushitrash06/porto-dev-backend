import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProjectsService } from './projects.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateProjectDto } from 'src/auth/dto/create-projects.dto';
import { UpdateProjectDto } from 'src/auth/dto/update-projects.dto';

@Controller('projects')
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectsService.create(user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.projectsService.findMine(user.userId);
    }

    @UseGuards(JwtAuthGuard)
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

        return this.projectsService.updateThumbnail(
            user.userId,
            id,
            imageUrl,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/images')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProjectImage(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const uploadedImage =
            await this.cloudinaryService.uploadImage(file);

        const imageUrl = (uploadedImage as any).secure_url;

        return this.projectsService.addProjectImage(
            user.userId,
            id,
            imageUrl,
        );
    }

    @Get('public/:userId')
    findPublicByUser(@Param('userId') userId: string) {
        return this.projectsService.findPublicByUser(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(user.userId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.projectsService.remove(user.userId, id);
    }
}