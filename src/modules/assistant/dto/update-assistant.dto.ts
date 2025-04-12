export class UpdateAssistantDto {
  readonly teamId: string;
  readonly llmId: string;
  readonly assistantId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly hasKnowledgeBase: boolean | undefined;
  readonly hasWorkflow: boolean | undefined;
  readonly tools: string[];

  constructor(
    teamId: string,
    llmId: string,
    assistantId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    hasKnowledgeBase: boolean | undefined,
    hasWorkflow: boolean | undefined,
    tools: string[],
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.hasKnowledgeBase = Boolean(hasKnowledgeBase);
    this.hasWorkflow = Boolean(hasWorkflow);
    this.tools = tools;
  }

  static fromInput(input: {
    teamId: string;
    llmId: string;
    id: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    hasKnowledgeBase?: boolean | undefined;
    hasWorkflow?: boolean | undefined;
    tools: string[];
  }): UpdateAssistantDto {
    return new UpdateAssistantDto(
      input.teamId,
      input.llmId,
      input.id,
      input.title,
      input.description,
      input.systemPrompt,
      input.isShared || false,
      input.hasKnowledgeBase || false,
      input.hasWorkflow || false,
      input.tools,
    );
  }
}
