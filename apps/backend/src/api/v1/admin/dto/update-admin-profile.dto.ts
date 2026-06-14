import { z } from 'zod';

export const updateAdminProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),

  department: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
  locality: z.string().min(1),
});

export type UpdateAdminProfileDto =
  z.infer<typeof updateAdminProfileSchema>;