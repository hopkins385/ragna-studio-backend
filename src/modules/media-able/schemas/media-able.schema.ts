import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';
import { MediaAbleTypeEnum } from '../enum/media-able.enum';

const mediaAbleModelSchema = z.object({
  id: cuidSchema,
  type: z.nativeEnum(MediaAbleTypeEnum),
});

export const mediaAbleSchema = z.object({
  model: mediaAbleModelSchema,
});
