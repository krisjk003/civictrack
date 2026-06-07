// src/api/v1/complaints/complaints.controller.ts

import { Request, Response } from 'express';
import { complaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint.dto';
import { ApiResponse } from '../../../shared/utils/api-response';
import { BadRequestError } from '../../../shared/errors/http-errors';

export class ComplaintsController {
  /**
   * POST /api/v1/complaints
   * Create a new complaint (any authenticated user)
   */
  async create(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const dto = req.body as CreateComplaintDto;

    const complaint = await complaintsService.create(dto, user);

    ApiResponse.created(res, complaint, 'Complaint submitted successfully');
  }

  /**
   * GET /api/v1/complaints
   * List complaints (citizens see only their own; admins see all)
   */
  async findAll(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    const page = parseInt((req.query['page'] as string) ?? '1', 10);
    const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10), 100);

    if (page < 1 || limit < 1) {
      throw new BadRequestError('Page and limit must be positive integers');
    }

    const { data, total } = await complaintsService.findAll(
      {
        status: req.query['status'] as string | undefined,
        category: req.query['category'] as string | undefined,
        limit,
        page,
      } as Parameters<typeof complaintsService.findAll>[0],
      user,
    );

    ApiResponse.success(res, data, 'Complaints retrieved successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  /**
   * GET /api/v1/complaints/:id
   * Get a single complaint by ID
   */
  async findById(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const id = req.params.id as string;

    const complaint = await complaintsService.findById(id, user);

    ApiResponse.success(res, complaint, 'Complaint retrieved successfully');
  }

  /**
   * PUT /api/v1/complaints/:id/status
   * Update complaint status (admin/moderator only)
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const id = req.params.id as string;
    const dto = req.body as UpdateComplaintStatusDto;

    const updated = await complaintsService.updateStatus(id, dto, user);

    ApiResponse.success(res, updated, 'Complaint status updated successfully');
  }
}

export const complaintsController = new ComplaintsController();