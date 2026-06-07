// src/config/storage.config.ts

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

function initializeCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials are missing. ' +
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env',
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

initializeCloudinary();

export { cloudinary };

export const storageConfig = {
  uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'civictrack/complaints',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as string[],
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
};