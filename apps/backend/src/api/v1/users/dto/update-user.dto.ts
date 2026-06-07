// src/api/v1/users/dto/update-user.dto.ts

import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
    .optional(),

  // Only admins should be able to change roles — enforced in the service layer
  // The DTO accepts it, the service enforces the policy.
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;