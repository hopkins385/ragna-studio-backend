import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const createChatSchema = z.object({
  assistantId: cuidSchema,
});
