import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const folderIdSchema = z.object({
  folderId: cuidSchema,
});
const projectIdSchema = z.object({
  projectId: cuidSchema,
});
const runIdSchema = z.object({
  runId: cuidSchema,
});
const imageIdSchema = z.object({
  imageId: cuidSchema,
});

export class ProjectIdParam extends createZodDto(projectIdSchema) {}

export class FolderIdParam extends createZodDto(folderIdSchema) {}

export class RunIdParam extends createZodDto(runIdSchema) {}

export class ImageIdParam extends createZodDto(imageIdSchema) {}
