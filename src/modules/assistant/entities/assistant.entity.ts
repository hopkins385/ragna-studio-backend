export class AssistantEntity {
  id: string;
  title: string;
  systemPrompt: string;
  hasKnowledgeBase: boolean;
  hasWorkflow: boolean;
  tools: any[];
}
