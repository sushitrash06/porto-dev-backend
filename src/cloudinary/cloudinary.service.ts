import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(file: Express.Multer.File) {
        return this.uploadFile(file, 'profiles', 'image');
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'profiles',
        resourceType: 'image' | 'raw' | 'auto' = 'auto',
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder,
                        resource_type: resourceType,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    },
                )
                .end(file.buffer);
        });
    }

    async deleteImageByUrl(imageUrl?: string | null) {
        return this.deleteFileByUrl(imageUrl, 'image');
    }

    async deleteFileByUrl(
        imageUrl?: string | null,
        resourceType: 'image' | 'raw' | 'auto' = 'auto',
    ) {
        if (!imageUrl) return;

        const publicId = this.getPublicIdFromUrl(imageUrl);

        if (!publicId) return;

        return cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    }

    private getPublicIdFromUrl(imageUrl: string) {
        const uploadIndex = imageUrl.indexOf('/upload/');

        if (uploadIndex === -1) return null;

        const pathAfterUpload = imageUrl.substring(
            uploadIndex + '/upload/'.length,
        );

        const pathWithoutVersion = pathAfterUpload.replace(
            /^v\d+\//,
            '',
        );

        return pathWithoutVersion.replace(/\.[^/.]+$/, '');
    }
}