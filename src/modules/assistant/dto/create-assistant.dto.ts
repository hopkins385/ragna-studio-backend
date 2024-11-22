import { createZodDto } from 'nestjs-zod';
import { createAssistantSchema } from '../schemas/create-assistant.schema';

export class CreateAssistantBody extends createZodDto(createAssistantSchema) {}

export class CreateAssistantDto {
  readonly teamId: string;
  readonly llmId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly systemPromptTokenCount: number;
  readonly tools: string[];

  constructor(
    teamId: string,
    llmId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
    tools: string[],
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
    this.tools = tools;
  }

  static fromInput(input: {
    teamId: string;
    llmId: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
    tools: string[];
  }): CreateAssistantDto {
    return new CreateAssistantDto(
      input.teamId,
      input.llmId,
      input.title,
      input.description,
      input.systemPrompt,
      input.isShared || false,
      input.systemPromptTokenCount,
      input.tools,
    );
  }
}
