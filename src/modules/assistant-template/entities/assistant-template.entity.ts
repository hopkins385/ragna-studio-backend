interface AssistantTemplatePrompt {
  de: string;
  en: string;
}

export class AssistantTemplateEntity {
  id: string;
  llmId: string;
  title: string;
  description: string;
  systemPrompt: AssistantTemplatePrompt;

  constructor(
    id: string,
    llmId: string,
    title: string,
    description: string,
    systemPrompt: AssistantTemplatePrompt,
  ) {
    this.id = id;
    this.llmId = llmId;
    this.title = title;
    this.description = description;
    this.systemPrompt = systemPrompt;
  }

  static fromInput(input: {
    id: string;
    llmId: string;
    title: string;
    description: string;
    systemPrompt: AssistantTemplatePrompt;
  }) {
    return new AssistantTemplateEntity(
      input.id,
      input.llmId,
      input.title,
      input.description,
      input.systemPrompt,
    );
  }
}
