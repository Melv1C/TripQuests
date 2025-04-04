import { z } from 'zod';

/**
 * Validation schema for user registration form
 */
export const registerSchema = z.object({
  pseudo: z
    .string()
    .min(3, 'Pseudo must be at least 3 characters')
    .max(20, 'Pseudo cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Pseudo can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Type inference for the register form data
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Validation schema for user login form
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Type inference for the login form data
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Validation schema for profile updates
 */
export const updateProfileSchema = z.object({
  pseudo: z
    .string()
    .min(3, 'Pseudo must be at least 3 characters')
    .max(20, 'Pseudo cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Pseudo can only contain letters, numbers, and underscores'),
  avatarFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, GIF, or WEBP)'
    )
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Image must be less than 5MB'
    )
});

/**
 * Type inference for the profile update form data
 */
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>; 