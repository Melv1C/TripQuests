import { z } from 'zod';

/**
 * Zod schema for validating trip creation form data
 */
export const createTripSchema = z.object({
  name: z
    .string()
    .min(3, 'Trip name must be at least 3 characters')
    .max(50, 'Trip name cannot exceed 50 characters'),
  description: z
    .string()
    .max(300, 'Description cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  startDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid date',
    }),
  endDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'End date must be a valid date',
    })
})
.refine(
  (data) => {
    // If both dates are provided, ensure endDate is after startDate
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  }
);

/**
 * Zod schema for validating join trip form data
 */
export const joinTripSchema = z.object({
  inviteCode: z
    .string()
    .min(6, 'Invite code must be 6 characters')
    .max(6, 'Invite code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code must contain only uppercase letters and numbers')
});

export type CreateTripFormData = z.infer<typeof createTripSchema>;
export type JoinTripFormData = z.infer<typeof joinTripSchema>; 