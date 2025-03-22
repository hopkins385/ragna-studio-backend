import { Injectable, Logger } from '@nestjs/common';
import { tool } from 'ai';
import {
  GetToolPayload,
  ToolContext,
  Tools,
  ToolOptions,
} from '../interfaces/assistant-tool-function.interface';
import { ThinkTool } from '@/modules/assistant-tool-function/tools/think.tool';
import { WebSearchTool } from '@/modules/assistant-tool-function/tools/websearch.tool';
import { WebScrapeTool } from '@/modules/assistant-tool-function/tools/webscrape.tool';
import { KnowledgeTool } from '@/modules/assistant-tool-function/tools/knowledge.tool';
import { EditorCommentTool } from '@/modules/assistant-tool-function/tools/editor-comment.tool';
import { ToolProvider } from '@/modules/assistant-tool-function/types/tool-provider';

@Injectable()
export class AssistantToolFactory {
  private readonly logger = new Logger(AssistantToolFactory.name);
  private readonly toolProviders: Map<number, ToolProvider>;

  constructor(
    private readonly webSearchTool: WebSearchTool,
    private readonly webScrapeTool: WebScrapeTool,
    private readonly knowledgeTool: KnowledgeTool,
    private readonly editorCommentTool: EditorCommentTool,
    private readonly thinkTool: ThinkTool,
  ) {
    const entries: Array<[number, ToolProvider]> = [
      [1, this.webSearchTool],
      [2, this.webScrapeTool],
      [3, this.knowledgeTool],
      [4, this.editorCommentTool],
      [5, this.thinkTool],
    ];

    // Validate all tools implement ToolProvider interface
    entries.forEach(([id, provider]) => {
      if (!provider || typeof provider.execute !== 'function') {
        throw new Error(`Invalid tool provider for ID ${id}`);
      }
    });

    this.toolProviders = new Map<number, ToolProvider>(entries);
  }

  public getTools(payload: GetToolPayload, options?: ToolOptions): Tools {
    // Add validation for payload
    if (!payload || typeof payload !== 'object' || !payload.assistantTools?.length) {
      this.logger.debug('No tools found in payload');
      return {};
    }

    const baseContext: Omit<ToolContext, 'toolId'> = {
      userId: payload.userId,
      assistantId: payload.assistantId,
      chatId: payload?.chatId,
      chatMessageId: payload?.chatMessageId,
    };

    // Filter out unwanted tool providers
    const entries = payload.assistantTools
      .map((t) => ({ tool: t, provider: this.toolProviders.get(t.functionId) }))
      .filter((item): item is { tool: any; provider: ToolProvider } => item.provider !== undefined)
      .reduce<Tools>((acc, { tool, provider }) => {
        const metadata = provider.getMetadata();
        // Create tool-specific context with toolId
        const context: ToolContext = {
          ...baseContext,
          toolId: tool.id,
        };
        acc[metadata.name] = this.createTool(provider, context, options);
        return acc;
      }, {});

    return entries;
  }

  private createTool(toolProvider: ToolProvider, context: ToolContext, options: ToolOptions) {
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

          // Add timeout to prevent hanging
          const timeoutMs = options?.timeoutMs || 300000;
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Tool execution timeout')), timeoutMs);
          });

          const result = await Promise.race([
            toolProvider.execute(params, context, options),
            timeoutPromise,
          ]);

          // Clear the timeout if execution completed successfully
          clearTimeout(timeoutId);

          // Log the result
          this.logger.debug(`Tool executed successfully: ${meta.name}`);
          // Log the input parameters
          this.logger.debug(`Input parameters: ${JSON.stringify(params)}`);
          // Log the result
          this.logger.debug(`Tool result: ${JSON.stringify(result)}`);

          return result;
        } catch (error: unknown) {
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
