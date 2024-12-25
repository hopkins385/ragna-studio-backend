import { z } from 'zod';
import { paginateQuerySchema } from '@/common/schemas/paginate.schema';

export const showHiddenQuerySchema = z.object({
  // needs to be a string of either true or false
  showHidden: z
    .string()
    .trim()
    .default('false')
    .transform((val) => val === 'true')
    .optional(),
});

export const textToImagePaginatedQuerySchema = paginateQuerySchema.merge(
  showHiddenQuerySchema,
);
