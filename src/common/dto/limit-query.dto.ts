import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const limitQuerySchema = z.object({
  limit: z
    .string()
    .trim()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, {
      message: 'Limit must be greater than 0',
    })
    .optional(),
});
export class LimitQuery extends createZodDto(limitQuerySchema) {}
