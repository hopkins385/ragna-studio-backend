export interface AssistantTemplatePrompt {
  de: string;
  en: string;
}

export interface AssistantTemplateConfig {
  icon: string;
  color: string;
  free: boolean;
}

export class AssistantTemplateEntity {
  id: string;
  llmId: string;
  title: string;
  description: string;
  systemPrompt?: AssistantTemplatePrompt;
  config: AssistantTemplateConfig;

  constructor(
    id: string,
    llmId: string,
    title: string,
    description: string,
    systemPrompt?: AssistantTemplatePrompt,
    config?: AssistantTemplateConfig,
  ) {
    this.id = id;
    this.llmId = llmId;
    this.title = title;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.config = config;
  }

  static fromInput(input: {
    id: string;
    llmId: string;
    title: string;
    description: string;
    systemPrompt?: AssistantTemplatePrompt;
    config?: AssistantTemplateConfig;
  }) {
    return new AssistantTemplateEntity(
      input.id,
      input.llmId,
      input.title,
      input.description,
      input.systemPrompt,
      input.config,
    );
  }
}
