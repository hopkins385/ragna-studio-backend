import { Assistant, AssistantTool, LargeLangModel, Tool } from '@prisma/client';

export type AssistantToolWithRelations = AssistantTool & {
  tool: Tool;
};

export type AssistantWithRelations = Assistant & {
  llm: LargeLangModel;
  tools: AssistantToolWithRelations[];
};
