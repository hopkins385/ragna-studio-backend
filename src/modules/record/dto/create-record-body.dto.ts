import { createZodDto } from 'nestjs-zod';
import { createRecordSchema } from '@/modules/record/schemas/create-record.schema';

export class CreateRecordBody extends createZodDto(createRecordSchema) {}
