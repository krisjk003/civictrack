// src/api/v1/complaints/dto/create-complaint.dto.ts

import { z } from 'zod';

export const ComplaintCategory = z.enum([
  'road',
  'water',
  'electricity',
  'sanitation',
  'public_safety',
  'parks',
  'noise',
  'other',
]);

export const ComplaintStatus = z.enum([
  'pending',
  'in_progress',
  'resolved',
  'rejected',
]);

export const ComplaintPriority = z.enum(['low', 'medium', 'high', 'critical']);

export const createComplaintSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),

  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),

  category: ComplaintCategory,

  imageUrls: z
    .array(z.string().url('Each imageUrl must be a valid URL'))
    .max(5, 'Maximum 5 images allowed')
    .default([]),

  latitude: z
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export type CreateComplaintDto = z.infer<typeof createComplaintSchema>;
export type ComplaintCategoryType = z.infer<typeof ComplaintCategory>;
export type ComplaintStatusType = z.infer<typeof ComplaintStatus>;
export type ComplaintPriorityType = z.infer<typeof ComplaintPriority>;