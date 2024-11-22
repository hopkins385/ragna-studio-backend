import { createZodDto } from 'nestjs-zod';
import { mediaAbleSchema } from '../schemas/media-able.schema';

export class MediaAbleBody extends createZodDto(mediaAbleSchema) {}
