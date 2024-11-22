import { createZodDto } from 'nestjs-zod';
import {
  paginateQuerySchema,
  paginateSchema,
} from '../schemas/paginate.schema';

export class PaginateBody extends createZodDto(paginateSchema) {}

export class PaginateQuery extends createZodDto(paginateQuerySchema) {}
