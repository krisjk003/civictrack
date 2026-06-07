// src/app.ts

import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { appConfig } from './config/app.config';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

// Route imports
import complaintsRouter from './api/v1/complaints/complaints.routes';
import usersRouter from './api/v1/users/users.routes';
import adminRouter from './api/v1/admin/admin.routes';
import uploadsRouter from './api/v1/uploads/uploads.routes';

export function createApp(): Application {
  const app = express();

  // ─── Security Middleware ───────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) {
          callback(null, true);
          return;
        }
        if (appConfig.cors.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin "${origin}" is not allowed`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );

  // ─── Request Logging ───────────────────────────────────────────────────────
  app.use(morgan(appConfig.isDevelopment ? 'dev' : 'combined'));

  // ─── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ─── Global Rate Limiting ──────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1', // skip localhost in dev
  });
  app.use(globalLimiter);

  // Stricter limiter for upload endpoint
  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Upload limit reached. Please wait before uploading again.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    },
  });

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      version: appConfig.apiVersion,
      environment: appConfig.env,
      timestamp: new Date().toISOString(),
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────
  const apiPrefix = `/api/${appConfig.apiVersion}`;

  app.use(`${apiPrefix}/complaints`, complaintsRouter);
  app.use(`${apiPrefix}/users`, usersRouter);
  app.use(`${apiPrefix}/admin`, adminRouter);
  app.use(`${apiPrefix}/uploads`, uploadLimiter, uploadsRouter);

  // ─── 404 Handler ──────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler (must be last) ──────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}