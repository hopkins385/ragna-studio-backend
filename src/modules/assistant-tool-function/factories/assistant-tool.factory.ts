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
      [1, webSearchTool],
      [2, webScrapeTool],
      [3, knowledgeTool],
      [4, restApiTool],
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

    const entries = payload.functionIds
      .map((id) => this.toolProviders.get(id))
      .filter((provider): provider is ToolProvider => provider !== undefined)
      .map((provider) => [
        provider.name,
        this.createTool(provider, context, options),
      ]);

    return Object.fromEntries(entries);
  }

  private createTool(
    provider: ToolProvider,
    context: ToolContext,
    options: ToolOptions,
  ) {
    return tool({
      description: provider.description,
      parameters: provider.parameters,
      execute: async (params: any) => {
        context.emitToolInfoData({
          toolName: provider.name,
          toolInfo: Object.values(params)?.[0].toString() || '',
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await provider.execute(params, context, options);
      },
    });
  }
}
