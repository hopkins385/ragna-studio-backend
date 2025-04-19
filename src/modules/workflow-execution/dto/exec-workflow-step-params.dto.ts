import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const execWorkflowStepSchena = z.object({
  id: cuidSchema,
  stepId: cuidSchema,
});

export class ExecWorkflowStepParams extends createZodDto(execWorkflowStepSchena) {}
