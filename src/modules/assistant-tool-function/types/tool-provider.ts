import type { ZodObject, ZodType } from 'zod';
import {
  ToolContext,
  ToolOptions,
} from '../interfaces/assistant-tool-function.interface';

export interface ToolMetadata {
  name: string;
  description: string;
}

export abstract class ToolProvider<
  TParams extends Record<string, any> = any,
  TResponse = any,
> {
  private name: string;
  private description: string;
  private parameters: ZodType<any>;

  constructor(metadata: ToolMetadata & { parameters: ZodObject<any> }) {
    this.name = metadata.name;
    this.description = metadata.description;
    this.parameters = metadata.parameters;
  }

  public abstract execute(
    params: TParams,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<TResponse>;

  public updateMetadata(
    metadata: ToolMetadata & { parameters: ZodObject<any> },
  ) {
    this.description = metadata.description;
    this.name = metadata.name;
    this.parameters = metadata.parameters;
  }

  public getMetadata() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }
}
