import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const tokenHistoryQuerySchema = z.object({
  year: z.string().trim().length(4),
  month: z.string().trim().min(1).max(2),
});

export class TokenUsageHistoryQuery extends createZodDto(
  tokenHistoryQuerySchema,
) {}
