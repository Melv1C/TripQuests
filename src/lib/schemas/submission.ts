import { z } from 'zod';

/**
 * Zod schema for submission form
 */
export const submissionSchema = z.object({
  imageFile: z
    .instanceof(File, { message: 'Image file is required' })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB max size
      { message: 'Image file must be less than 10MB' }
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      { message: 'Only JPEG and PNG images are supported' }
    ),
  notes: z
    .string()
    .max(200, 'Notes cannot exceed 200 characters')
    .optional(),
});

export type SubmissionFormSchema = z.infer<typeof submissionSchema>; 