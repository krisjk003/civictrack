// src/api/v1/complaints/complaints.routes.ts

import { Router } from 'express';
import { complaintsController } from './complaints.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { createComplaintSchema } from './dto/create-complaint.dto';
import { updateComplaintStatusSchema } from './dto/update-complaint.dto';
import { UserRole } from '../../../shared/types/roles.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/complaints
 * Submit a new complaint — any authenticated user
 */
router.post(
  '/',
  validate(createComplaintSchema, 'body'),
  asyncHandler(complaintsController.create.bind(complaintsController)),
);

/**
 * GET /api/v1/complaints
 * List complaints — citizens see own; admins/moderators see all
 * Query params: ?status=pending&category=road&page=1&limit=20
 */
router.get(
  '/',
  asyncHandler(complaintsController.findAll.bind(complaintsController)),
);

/**
 * GET /api/v1/complaints/:id
 * Get a single complaint
 */
router.get(
  '/:id',
  asyncHandler(complaintsController.findById.bind(complaintsController)),
);

/**
 * PUT /api/v1/complaints/:id/status
 * Update complaint status — admin and moderator only
 */
router.put(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.MODERATOR),
  validate(updateComplaintStatusSchema, 'body'),
  asyncHandler(complaintsController.updateStatus.bind(complaintsController)),
);

export default router;