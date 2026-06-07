// src/server.ts

import 'dotenv/config';

// Initialize Firebase and Cloudinary before app is created.
// These throw early with clear messages if credentials are missing.
import './config/firebase.config';
import './config/storage.config';

import { createApp } from './app';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = createApp();

  const server = app.listen(appConfig.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║        CivicTrack API Server             ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Environment : ${appConfig.env.padEnd(25)}║`);
    console.log(`║  Port        : ${String(appConfig.port).padEnd(25)}║`);
    console.log(`║  API Base    : /api/${appConfig.apiVersion.padEnd(20)}║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  Routes registered:');
    console.log(`  → POST   /api/${appConfig.apiVersion}/uploads/image`);
    console.log(`  → GET    /api/${appConfig.apiVersion}/users/me`);
    console.log(`  → PUT    /api/${appConfig.apiVersion}/users/me`);
    console.log(`  → POST   /api/${appConfig.apiVersion}/complaints`);
    console.log(`  → GET    /api/${appConfig.apiVersion}/complaints`);
    console.log(`  → GET    /api/${appConfig.apiVersion}/complaints/:id`);
    console.log(`  → PUT    /api/${appConfig.apiVersion}/complaints/:id/status`);
    console.log(`  → GET    /api/${appConfig.apiVersion}/admin/dashboard-stats`);
    console.log('');
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed. Exiting process.');
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      console.error('[Server] Graceful shutdown timeout. Forcing exit.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Unhandled Rejection Safety Net ────────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[Server] Unhandled Promise Rejection:', reason);
    // In production, shut down and let the process manager restart
    if (appConfig.isProduction) {
      shutdown('unhandledRejection');
    }
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('[Server] Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
}

bootstrap().catch((error: unknown) => {
  console.error('[Server] Fatal startup error:', error);
  process.exit(1);
});