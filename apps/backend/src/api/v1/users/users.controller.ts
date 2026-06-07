// src/api/v1/users/users.controller.ts

import { Request, Response } from 'express';
import { usersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from '../../../shared/utils/api-response';

export class UsersController {
  /**
   * GET /api/v1/users/me
   * Returns the authenticated user's profile.
   * Creates the Firestore document if it doesn't exist yet (first login flow).
   */
  async getMe(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const profile = await usersService.getMe(user);
    ApiResponse.success(res, profile, 'User profile retrieved successfully');
  }

  /**
   * PUT /api/v1/users/me
   * Updates the authenticated user's own profile.
   */
  async updateMe(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const dto = req.body as UpdateUserDto;

    const updated = await usersService.updateMe(dto, user);
    ApiResponse.success(res, updated, 'Profile updated successfully');
  }
}

export const usersController = new UsersController();