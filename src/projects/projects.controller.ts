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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProjectsService } from './projects.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CurrentUser } from 'src/auth/detectors/create-user.decorator';
import { CreateProjectDto } from 'src/auth/dto/create-projects.dto';
import { UpdateProjectDto } from 'src/auth/dto/update-projects.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new personal project' })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectsService.create(user.userId, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all personal projects of logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMine(@CurrentUser() user: any) {
        return this.projectsService.findMine(user.userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific personal project of logged-in user' })
    @UseGuards(JwtAuthGuard)
    @Get('me/:id')
    findOneMine(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.projectsService.findOneOwned(
            user.userId,
            id,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload project thumbnail' })
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
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload an additional project image' })
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
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiOperation({ summary: 'Get public projects of a user' })
    @Get('public/:userId')
    findPublicByUser(@Param('userId') userId: string) {
        return this.projectsService.findPublicByUser(userId);
    }

    @ApiOperation({ summary: 'Get details of a public project' })
    @Get('public/:userId/:id')
    findOnePublic(
        @Param('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.projectsService.findOnePublic(
            userId,
            id,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update personal project details' })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(
            user.userId,
            id,
            dto,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a personal project' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.projectsService.remove(
            user.userId,
            id,
            user.role === 'SUPER_ADMIN',
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a project image by URL' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id/images')
    async removeProjectImage(
        @CurrentUser() user: any,

        @Param('id') id: string,

        @Body('imageUrl')
        imageUrl: string,
    ) {
        await this.cloudinaryService.deleteImageByUrl(
            imageUrl,
        );

        return this.projectsService.removeProjectImage(
            user.userId,
            id,
            imageUrl,
            user.role === 'SUPER_ADMIN',
        );
    }
}