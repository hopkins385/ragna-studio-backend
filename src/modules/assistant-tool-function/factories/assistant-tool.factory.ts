import { Injectable, Logger } from '@nestjs/common';
import { tool } from 'ai';
import {
  GetToolPayload,
  ToolContext,
  Tools,
  ToolOptions,
} from '../interfaces/assistant-tool-function.interface';
import { WebSearchTool } from '../tools/websearch.tool';
import { ToolProvider } from '../types/tool-provider';
import { WebScrapeTool } from '../tools/webscrape.tool';
import { KnowledgeTool } from '../tools/knowledge.tool';

@Injectable()
export class AssistantToolFactory {
  private readonly logger = new Logger(AssistantToolFactory.name);
  private readonly toolProviders: Map<number, ToolProvider>;

  constructor(
    private readonly webSearchTool: WebSearchTool,
    private readonly webScrapeTool: WebScrapeTool,
    private readonly knowledgeTool: KnowledgeTool,
  ) {
    const entries: Array<[number, ToolProvider]> = [
      [1, this.webSearchTool],
      [2, this.webScrapeTool],
      [3, this.knowledgeTool],
    ];

    this.toolProviders = new Map<number, ToolProvider>(entries);
  }

  public getTools(
    payload: GetToolPayload,
    options?: ToolOptions,
  ): Tools | undefined {
    if (!payload.functionIds?.length) {
      return undefined;
    }

    const context: ToolContext = {
      assistantId: payload.assistantId,
      emitToolInfoData: payload.emitToolInfoData,
    };

    // Filter out unwanted tool providers
    const entries = payload.functionIds
      .map((id) => this.toolProviders.get(id))
      .filter(
        (toolProvider): toolProvider is ToolProvider =>
          toolProvider !== undefined,
      )
      .reduce<Tools>((acc, toolProvider) => {
        const metadata = toolProvider.getMetadata();
        acc[metadata.name] = this.createTool(toolProvider, context, options);
        return acc;
      }, {});

    return entries;
  }

  private createTool(
    toolProvider: ToolProvider,
    context: ToolContext,
    options: ToolOptions,
  ) {
    const meta = toolProvider.getMetadata();
    return tool({
      description: meta.description,
      parameters: meta.parameters,
      execute: async (params: any) => {
        // Emit tool info data
        context.emitToolInfoData({
          toolName: meta.name,
          toolInfo: Object.values(params)?.[0].toString() || '',
        });
        // Slight delay to give frontend time to render
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Execute the tool
        try {
          return await toolProvider.execute(params, context, options);
        } catch (error) {
          this.logger.error(`Error executing tool: ${meta.name}`, error);
          return {
            message: 'An error occurred while executing the tool',
          };
        }
      },
    });
  }
}
