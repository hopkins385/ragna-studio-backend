import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const editorCompletionSchema = z.object({
  context: z.string().trim().min(1),
  selectedText: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
});

export class EditorCompletionBody extends createZodDto(editorCompletionSchema) {}

export type EditorCompletionBodyType = z.infer<typeof editorCompletionSchema>;
