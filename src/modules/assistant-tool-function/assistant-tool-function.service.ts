import { Injectable, Logger } from '@nestjs/common';
import { AssistantToolFactory } from './factories/assistant-tool.factory';
import { GetToolPayload, ToolOptions, Tools } from './interfaces/assistant-tool-function.interface';

@Injectable()
export class AssistantToolFunctionService {
  private readonly logger = new Logger(AssistantToolFunctionService.name);

  constructor(private readonly assistantToolFactory: AssistantToolFactory) {}

  public getTools(payload: GetToolPayload, options?: ToolOptions): Tools {
    return this.assistantToolFactory.getTools(payload, options);
  }
}
