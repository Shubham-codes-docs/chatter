import { z } from 'zod';

// profile schema
export const profileSchema = z.object({
  fullName: z.string().min(3, 'Full Name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email address'),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional(),
});
