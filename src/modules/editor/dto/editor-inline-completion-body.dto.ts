import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

interface TextContext {
  precedingText: string; // More than just current line (previous 3-5 paragraphs)
  followingText?: string; // Text after cursor position (next paragraph)
  currentLineText: string; // The immediate line text for local context
  currentWord: string; // The word being typed
  precedingWords: string[]; // Previous 5-10 words for immediate context
}

interface DocumentContext {
  documentType: string; // Article, code, email, etc.
  language?: string; // Programming language or natural language
  headings?: string[]; // Document section headings
  currentSectionTitle?: string; // Current section user is editing
  documentSummary?: string; // Brief semantic summary of the document
}

interface EditorContext {
  cursorPosition: number; // Absolute position in document
  relativePosition: {
    // Position relative to structures
    paragraphIndex: number;
    sentenceIndex: number;
    wordIndex: number;
  };
  recentEdits: Array<{
    // Recent edit history
    timestamp: number;
    text: string;
    position: number;
    operation: 'insert' | 'delete' | 'replace';
  }>;
  acceptedCompletions?: string[]; // Previously accepted suggestions
}

interface CompletionRequestContext {
  textContext: TextContext;
  documentContext?: DocumentContext;
  editorContext: EditorContext;
  timeout: number;
  maxTokens?: number; // Control response length
  temperature?: number; // Control randomness
}

const inlineCompletionSchema = z.object({
  textContext: z.object({
    precedingText: z.string(),
    followingText: z.string().optional(),
    currentLineText: z.string(),
    currentWord: z.string(),
    precedingWords: z.array(z.string()),
  }),
  documentContext: z
    .object({
      documentType: z.string(),
      language: z.string().optional(),
      headings: z.array(z.string()).optional(),
      currentSectionTitle: z.string().optional(),
      documentSummary: z.string().optional(),
    })
    .optional(),
  editorContext: z.object({
    cursorPosition: z.number(),
    relativePosition: z.object({
      paragraphIndex: z.number(),
      sentenceIndex: z.number(),
      wordIndex: z.number(),
    }),
    recentEdits: z.array(
      z.object({
        timestamp: z.number(),
        text: z.string(),
        position: z.number(),
        operation: z.enum(['insert', 'delete', 'replace']),
      }),
    ),
    acceptedCompletions: z.array(z.string()).optional(),
  }),
  timeout: z.number(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

export class InlineCompletionBody extends createZodDto(inlineCompletionSchema) {}
