import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { cuidSchema } from '../schemas/cuid.schema';

const idSchema = z.object({ id: cuidSchema });
export class IdParam extends createZodDto(idSchema) {}
