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

    // Validate all tools implement ToolProvider interface
    entries.forEach(([id, provider]) => {
      if (
        !provider ||
        typeof provider.execute !== 'function' ||
        typeof provider.getMetadata !== 'function'
      ) {
        throw new Error(`Invalid tool provider for ID ${id}`);
      }
    });

    this.toolProviders = new Map<number, ToolProvider>(entries);
  }

  public getTools(
    payload: GetToolPayload,
    options?: ToolOptions,
  ): Tools | undefined {
    // Add validation for payload
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    if (!Array.isArray(payload.functionIds)) {
      return undefined;
    }

    if (!payload.functionIds?.length) {
      return undefined;
    }

    // Validate function IDs are numbers
    if (!payload.functionIds.every((id) => typeof id === 'number')) {
      this.logger.error(
        `Invalid function ID type in payload. Numbers expected but received: ${payload.functionIds}`,
      );
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
    if (!toolProvider || !context) {
      throw new Error('Invalid toolProvider or context');
    }

    const meta = toolProvider.getMetadata();
    if (!meta || !meta.name || !meta.parameters) {
      throw new Error('Invalid tool metadata');
    }

    return tool({
      description: meta.description || 'No description provided',
      parameters: meta.parameters,
      execute: async (params: any) => {
        let timeoutId: NodeJS.Timeout;
        try {
          // Validate params
          if (!params || typeof params !== 'object') {
            throw new Error('Invalid parameters provided to tool');
          }

          context.emitToolInfoData({
            toolName: meta.name,
            toolInfo: Object.values(params)?.[0]?.toString() || '',
          });

          // Add timeout to prevent hanging
          const timeoutMs = options?.timeoutMs || 30000;
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error('Tool execution timeout')),
              timeoutMs,
            );
          });

          const result = await Promise.race([
            toolProvider.execute(params, context, options),
            timeoutPromise,
          ]);

          // Clear the timeout if execution completed successfully
          clearTimeout(timeoutId);

          return result;
        } catch (error) {
          this.logger.error(`Error executing tool: ${meta.name}`, error);
          return {
            message: 'An error occurred while executing the tool',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }
}
