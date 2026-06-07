// src/api/v1/uploads/uploads.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { uploadsController } from './uploads.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { storageConfig } from '../../../config/storage.config';
import { BadRequestError } from '../../../shared/errors/http-errors';

const router = Router();

// Multer — store in memory (we stream directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: storageConfig.maxFileSizeBytes, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid file type "${file.mimetype}". Allowed: ${storageConfig.allowedMimeTypes.join(', ')}`,
        ),
      );
    }
  },
});

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/uploads/image
 * Upload a single image to Cloudinary.
 * Multipart field name must be "image".
 */
router.post(
  '/image',
  upload.single('image'),
  asyncHandler(uploadsController.uploadImage.bind(uploadsController)),
);

export default router;