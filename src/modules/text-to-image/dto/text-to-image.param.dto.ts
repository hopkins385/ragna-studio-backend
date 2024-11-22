import { createZodDto } from 'nestjs-zod';
import {
  folderIdSchema,
  projectIdSchema,
  runIdSchema,
} from '../schemas/params.schema';

export class ProjectIdParam extends createZodDto(projectIdSchema) {}

export class FolderIdParam extends createZodDto(folderIdSchema) {}

export class RunIdParam extends createZodDto(runIdSchema) {}
