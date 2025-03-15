import { timeout } from 'rxjs/operators';
import type { ZodObject, ZodType } from 'zod';

// Define a type for the emitToolInfoData function
export type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

// Define a type for the tools object
export type Tools = Record<string, ReturnType<any>>;

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

export interface GetToolPayload {
  userId: string;
  llmProvider: string;
  llmName: string;
  functionIds: number[] | null;
  assistantId: string;
  chatId?: string;
}

export interface ToolContext {
  userId: string;
  chatId: string;
  assistantId: string;
}

// Define a type for the tool configuration
export interface ToolConfig {
  id: number;
  name: string;
  description: string;
  parameters: Record<string, ZodType<any, any>>;
  execute: (params: any, emitToolInfoData: EmitToolInfoData) => Promise<any>;
}

export interface ToolOptions {
  timeoutMs?: number;
}

export interface ToolDefinition {
  id: number;
  name: string;
  description: string;
  parameters: ZodObject<any>;
  handler: (params: any, context: ToolContext, options?: ToolOptions) => Promise<any>;
}
