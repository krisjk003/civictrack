// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { ApiResponse } from '../shared/utils/api-response';
import { appConfig } from '../config/app.config';

interface ValidationError extends AppError {
  fieldErrors?: Record<string, string[]>;
}

/**
 * Global Express error-handling middleware.
 * Must be registered LAST, after all routes.
 * Catches all errors forwarded via next(err).
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Log in development; structured logging would go here for production
  if (appConfig.isDevelopment) {
    console.error('[Error]', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    // In production only log operational errors minimally; non-operational = unexpected crash
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // Operational, known errors (thrown by our code intentionally)
  if (err instanceof AppError && err.isOperational) {
    const validationErr = err as ValidationError;

    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      validationErr.fieldErrors,
    );
    return;
  }

  // Multer errors (file upload issues)
  if (err.name === 'MulterError') {
    ApiResponse.error(res, err.message, 400, 'FILE_UPLOAD_ERROR');
    return;
  }

  // Firestore / Firebase errors
  if (err.name === 'FirebaseError' || err.message?.includes('NOT_FOUND')) {
    ApiResponse.error(res, 'Database operation failed', 500, 'DATABASE_ERROR');
    return;
  }

  // Unknown / programming errors — don't leak details in production
  const message = appConfig.isDevelopment
    ? err.message
    : 'An unexpected error occurred. Please try again later.';

  ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
}

/**
 * 404 handler — registered after all routes but before globalErrorHandler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  ApiResponse.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND',
  );
}