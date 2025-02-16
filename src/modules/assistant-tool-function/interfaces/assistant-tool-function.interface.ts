import type { ZodType } from 'zod';

// Define a type for the emitToolInfoData function
export type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

// Define a type for the tools object
export type Tools = Record<string, ReturnType<any>>;

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

export interface GetToolPayload {
  llmProvider: string;
  llmName: string;
  functionIds: number[] | null;
  emitToolInfoData: EmitToolInfoData;
}

// Define a type for the tool configuration
export interface ToolConfig {
  id: number;
  name: string;
  description: string;
  parameters: Record<string, ZodType<any, any>>;
  execute: (params: any, emitToolInfoData: EmitToolInfoData) => Promise<any>;
}

export interface RagToolOptions {
  recordIds: string[];
}
