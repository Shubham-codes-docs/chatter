import { z } from 'zod';

// login schema
export const loginSchema = z.object({
  email: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

// register schema
export const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Full Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Current Password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(6, 'New Password must be at least 6 characters')
      .regex(/[A-Z]/, 'New Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'New Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'New Password must contain at least one number'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm New Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });
