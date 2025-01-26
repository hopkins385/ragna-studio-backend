import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { cuidSchema } from '@/common/schemas/cuid.schema';

interface FluxUltra {
  // Required field
  prompt: string;

  // Optional fields
  seed?: number;
  aspect_ratio?: string;
  safety_tolerance?: number;
  output_format?: 'jpeg' | 'png';
  raw?: boolean;
  image_prompt?: string;
  image_prompt_strength?: number;
}

const fluxUltraInputSchema = z.object({
  folderId: cuidSchema,
  imgCount: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(1)
    .describe('Number of images to generate.'),
  prompt: z
    .string()
    .trim()
    .min(1, 'Prompt is required')
    .describe('The prompt to use for image generation.'),
  seed: z
    .number()
    .int()
    .nullable()
    .optional()
    .describe('Optional seed for reproducibility.'),
  aspectRatio: z
    .string()
    .default('16:9')
    .describe('Aspect ratio of the image between 21:9 and 9:21'),
  safetyTolerance: z
    .number()
    .int()
    .min(0)
    .max(6)
    .default(2)
    .describe(
      'Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.',
    ),
  outputFormat: z
    .enum(['jpeg', 'png'])
    .default('jpeg')
    .describe("Output format for the generated image. Can be 'jpeg' or 'png'."),
  raw: z
    .boolean()
    .default(false)
    .describe('Generate less processed, more natural-looking images'),
  imagePrompt: z
    .string()
    .nullable()
    .optional()
    .describe('Optional image to remix in base64 format'),
  imagePromptStrength: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Blend between the prompt and the image prompt'),
});

export class FluxUltraBody extends createZodDto(fluxUltraInputSchema) {}
