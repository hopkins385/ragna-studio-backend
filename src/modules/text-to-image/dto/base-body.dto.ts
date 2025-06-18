import { cuidSchema } from '@/common/schemas/cuid.schema';
import { ImageAspectRatio } from '@/modules/text-to-image/enum/image-aspect-ratios.enum';
import { z } from 'zod';

export const baseTextToImageBodySchema = z.object({
  folderId: cuidSchema,
  prompt: z.string().min(1, 'Prompt is required'),
  imgCount: z.number().int().min(1).max(4).default(1).optional(),
  aspectRatio: z.nativeEnum(ImageAspectRatio).default('1:1').optional(),
  promptUpsampling: z.boolean().default(false).optional(),
  seed: z.number().int().nullable().optional(),
  safetyTolerance: z.number().min(0).max(6).default(2).optional(),
  outputFormat: z.enum(['jpeg', 'png']).default('jpeg').optional(),
});
