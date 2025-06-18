import { baseTextToImageBodySchema } from '@/modules/text-to-image/dto/base-body.dto';
import { createZodDto } from 'nestjs-zod';

// export const googleImageGenBodySchema = z.object({
//   prompt: z.string().min(5).max(1000),
//   negativePrompt: z.string().max(1000).optional(),
//   aspectRatio: z.nativeEnum(ImageAspectRatio).default('1:1'),
// }).merge(baseTextToImageBodySchema)

const googleImageGenBodySchema = baseTextToImageBodySchema.omit({
  promptUpsampling: true,
  seed: true,
  safetyTolerance: true,
});

export class GoogleImageGenBody extends createZodDto(googleImageGenBodySchema) {}
