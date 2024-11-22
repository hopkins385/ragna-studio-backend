import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const folderIdSchema = z.object({
  folderId: cuidSchema,
});
export const projectIdSchema = z.object({
  projectId: cuidSchema,
});
export const runIdSchema = z.object({
  runId: cuidSchema,
});
