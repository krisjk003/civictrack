// src/api/v1/complaints/dto/update-complaint.dto.ts

import { z } from 'zod';
import { ComplaintStatus, ComplaintPriority } from './create-complaint.dto';

export const updateComplaintStatusSchema = z.object({
  status: ComplaintStatus,
  priority: ComplaintPriority.optional(),
  note: z
    .string()
    .max(500, 'Note cannot exceed 500 characters')
    .trim()
    .optional(),
});

export type UpdateComplaintStatusDto = z.infer<typeof updateComplaintStatusSchema>;