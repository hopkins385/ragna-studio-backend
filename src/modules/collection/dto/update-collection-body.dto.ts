import { createZodDto } from 'nestjs-zod';
import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

const updateCollectionSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().or(z.string().min(3).max(255)),
});

export class UpdateCollectionBody extends createZodDto(
  updateCollectionSchema,
) {}
