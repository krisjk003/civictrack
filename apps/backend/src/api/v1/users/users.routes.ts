// src/api/v1/users/users.routes.ts

import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { updateUserSchema } from './dto/update-user.dto';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users/me
 * Get own profile
 */
router.get(
  '/me',
  asyncHandler(usersController.getMe.bind(usersController)),
);

/**
 * PUT /api/v1/users/me
 * Update own profile
 */
router.put(
  '/me',
  validate(updateUserSchema, 'body'),
  asyncHandler(usersController.updateMe.bind(usersController)),
);

export default router;