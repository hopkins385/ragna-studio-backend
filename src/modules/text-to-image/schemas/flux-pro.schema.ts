import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const FluxProInputsSchema = z.object({
  folderId: cuidSchema,
  prompt: z.string().min(1, 'Prompt is required'),
  imgCount: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(1)
    .describe('Number of images to generate.'),
  width: z
    .number()
    .int()
    .min(256)
    .max(1440)
    .multipleOf(32)
    .default(1024)
    .optional()
    .describe(
      'Width of the generated image in pixels. Must be a multiple of 32.',
    ),
  height: z
    .number()
    .int()
    .min(256)
    .max(1440)
    .multipleOf(32)
    .default(1024)
    .optional()
    .describe(
      'Height of the generated image in pixels. Must be a multiple of 32.',
    ),
  steps: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(40)
    .optional()
    .describe('Number of steps for the image generation process.'),
  prompt_upsampling: z
    .boolean()
    .default(false)
    .optional()
    .describe(
      'Whether to perform upsampling on the prompt. If active, automatically modifies the prompt for more creative generation.',
    ),
  seed: z
    .number()
    .int()
    .nullable()
    .optional()
    .describe('Optional seed for reproducibility.'),
  guidance: z
    .number()
    .min(1.5)
    .max(5.0)
    .default(2.5)
    .optional()
    .describe(
      'Guidance scale for image generation. High guidance scales improve prompt adherence at the cost of reduced realism.',
    ),
  safety_tolerance: z
    .number()
    .int()
    .min(0)
    .max(6)
    .default(2)
    .optional()
    .describe(
      'Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.',
    ),
  interval: z
    .number()
    .min(1.0)
    .max(4.0)
    .default(2.0)
    .optional()
    .describe('Interval parameter for guidance control.'),
});

// Infer the TypeScript type from the schema
export type FluxProInputs = z.infer<typeof FluxProInputsSchema>;
