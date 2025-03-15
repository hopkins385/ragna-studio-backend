import { Injectable, Logger } from '@nestjs/common';
import { AssistantToolFactory } from './factories/assistant-tool.factory';
import { GetToolPayload, ToolOptions, Tools } from './interfaces/assistant-tool-function.interface';

@Injectable()
export class AssistantToolFunctionService {
  private readonly logger = new Logger(AssistantToolFunctionService.name);

  constructor(private readonly assistantToolFactory: AssistantToolFactory) {}

  public getTools(payload: GetToolPayload, options?: ToolOptions): Tools {
    // temporary add always tool 4
    payload.functionIds.push(4);
    //
    const tools = this.assistantToolFactory.getTools(payload, options);

    if (!tools) {
      this.logger.warn('No tools found');
      return {};
    }

    this.logger.debug('Tools found:', tools);

    return tools;
  }
}
