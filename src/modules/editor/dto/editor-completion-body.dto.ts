import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const editorCompletionSchema = z.object({
  context: z.string(),
  selectedText: z.string(),
  prompt: z.string(),
});

export class EditorCompletionBody extends createZodDto(
  editorCompletionSchema,
) {}

export type EditorCompletionBodyType = z.infer<typeof editorCompletionSchema>;
