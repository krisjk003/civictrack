// src/api/v1/uploads/uploads.controller.ts

import { Request, Response } from 'express';
import { uploadsService } from './uploads.service';
import { ApiResponse } from '../../../shared/utils/api-response';
import { BadRequestError } from '../../../shared/errors/http-errors';

export class UploadsController {
  /**
   * POST /api/v1/uploads/image
   * Accepts multipart/form-data with field name "image".
   * Uploads to Cloudinary and returns the secure image URL.
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
  
    if (!req.file) {
      throw new BadRequestError(
        'No image file found. Send a multipart/form-data request with field name "image".',
      );
    }

   const result = await uploadsService.uploadImage(req.file);

    ApiResponse.created(res, result, 'Image uploaded successfully');
  }
}

export const uploadsController = new UploadsController();