// src/api/v1/uploads/uploads.service.ts

import { UploadApiResponse } from 'cloudinary';
import { cloudinary, storageConfig } from '../../../config/storage.config';
import { BadRequestError, InternalServerError } from '../../../shared/errors/http-errors';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class UploadsService {
  /**
   * Uploads a file buffer to Cloudinary.
   * Returns the secure URL and metadata.
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadedImage> {
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    if (!storageConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestError(
        `Invalid file type "${file.mimetype}". Allowed types: ${storageConfig.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > storageConfig.maxFileSizeBytes) {
      const maxMb = storageConfig.maxFileSizeBytes / (1024 * 1024);
      throw new BadRequestError(`File size exceeds the ${maxMb}MB limit`);
    }

    try {
      const result = await this.uploadBuffer(file.buffer, file.originalname);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;

      const message =
        error instanceof Error ? error.message : 'Unknown upload error';
      throw new InternalServerError(`Cloudinary upload failed: ${message}`);
    }
  }

  /**
   * Wraps Cloudinary's upload_stream in a Promise.
   */
  private uploadBuffer(
    buffer: Buffer,
    originalName: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: storageConfig.uploadFolder,
          resource_type: 'image',
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          // Strip EXIF data for privacy
          exif: false,
          // Eager transformation: auto-quality + auto-format
          eager: [{ quality: 'auto', fetch_format: 'auto' }],
          // Tag for easy filtering in Cloudinary dashboard
          tags: ['civictrack', 'complaint'],
          context: { original_filename: originalName },
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error('Cloudinary returned an empty result'));
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }
}

export const uploadsService = new UploadsService();