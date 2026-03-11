import { z } from 'zod';

// login schema
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// register schema
export const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Full Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[@$!%*?&]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters'),
    rememberMe: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

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
      .regex(/[0-9]/, 'New Password must contain at least one number')
      .regex(
        /[@$!%*?&]/,
        'New Password must contain at least one special character'
      ),
    confirmPassword: z
      .string()
      .min(6, 'Confirm New Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
