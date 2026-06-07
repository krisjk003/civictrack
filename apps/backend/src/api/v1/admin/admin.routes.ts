// src/api/v1/admin/admin.routes.ts

import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { UserRole } from '../../../shared/types/roles.types';

const router = Router();

// All admin routes require authentication AND admin/moderator role
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.MODERATOR));

/**
 * GET /api/v1/admin/dashboard-stats
 * Aggregate complaint + user counts for the admin dashboard
 */
router.get(
  '/dashboard-stats',
  asyncHandler(adminController.getDashboardStats.bind(adminController)),
);

export default router;