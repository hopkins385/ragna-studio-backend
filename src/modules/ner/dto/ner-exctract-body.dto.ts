import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const nerExtractBodySchema = z.object({
  text: z.string().trim().min(1),
  labels: z.array(z.string()).optional(),
});

export class NerExtractBody extends createZodDto(nerExtractBodySchema) {}
