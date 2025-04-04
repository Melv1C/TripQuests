import { z } from 'zod';

/**
 * Zod schema for quest creation form
 */
export const questSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  points: z.number()
    .positive('Points must be a positive number')
    .min(1, 'Minimum of 1 point required'),
  deadline: z.string()
    .optional()
    .refine(value => !value || new Date(value) > new Date(), {
      message: 'Deadline must be in the future',
    }),
});

export type QuestFormSchema = z.infer<typeof questSchema>; 