// src/api/v1/admin/admin.controller.ts

import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { ApiResponse } from '../../../shared/utils/api-response';

export class AdminController {
  /**
   * GET /api/v1/admin/dashboard-stats
   * Returns aggregated stats for the admin dashboard.
   * Accessible only by ADMIN and MODERATOR roles.
   */
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    const stats = await adminService.getDashboardStats();
    ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully');
  }
}

export const adminController = new AdminController();