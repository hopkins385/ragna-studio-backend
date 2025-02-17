import { RestApiTool } from './../tools/rest-api.tool';
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
    private readonly restApiTool: RestApiTool,
  ) {
    const entries: Array<[number, ToolProvider]> = [
      [1, this.webSearchTool],
      [2, this.webScrapeTool],
      [3, this.knowledgeTool],
      // [4, this.restApiTool],
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
        acc[toolProvider.name] = this.createTool(
          toolProvider,
          context,
          options,
        );
        return acc;
      }, {});

    return entries;
  }

  private createTool(
    toolProvider: ToolProvider,
    context: ToolContext,
    options: ToolOptions,
  ) {
    return tool({
      description: toolProvider.description,
      parameters: toolProvider.parameters,
      execute: async (params: any) => {
        // Emit tool info data
        context.emitToolInfoData({
          toolName: toolProvider.name,
          toolInfo: Object.values(params)?.[0].toString() || '',
        });
        // Slight delay to give frontend time to render
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Execute the tool
        return await toolProvider.execute(params, context, options);
      },
    });
  }
}
