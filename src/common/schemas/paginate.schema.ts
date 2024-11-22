import { z } from 'zod';

export const paginateSchema = z.object({
  page: z.number().default(1),
  searchQuery: z.string().trim().max(255).optional(),
});

export const paginateQuerySchema = z.object({
  // page is a string because it comes from the query params, but it should be a number greater than 0
  page: z
    .string()
    .trim()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, {
      message: 'Page must be greater than 0',
    }),
  limit: z
    .string()
    .trim()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, {
      message: 'Limit must be greater than 0',
    })
    .optional(),
  searchQuery: z.string().trim().max(255).optional(),
});
