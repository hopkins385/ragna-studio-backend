export class AssistantJobDto {
  readonly stepIndex: number;
  readonly rowIndex: number;
  readonly stepName: string;
  readonly llmProvider: string;
  readonly llmNameApi: string;
  readonly assistantId: string;
  readonly inputDocumentItemIds: string[];
  readonly documentItemId: string;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly userId: string;
  readonly workflowId: string;

  constructor(
    stepIndex: number,
    rowIndex: number,
    stepName: string,
    assistantId: string,
    llmProvider: string,
    llmNameApi: string,
    inputDocumentItemIds: string[],
    documentItemId: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    userId: string,
    workflowId: string,
  ) {
    this.stepIndex = Number(stepIndex);
    this.rowIndex = Number(rowIndex);
    this.stepName = stepName;
    this.assistantId = assistantId.toLowerCase();
    this.llmProvider = llmProvider;
    this.llmNameApi = llmNameApi;
    this.inputDocumentItemIds = inputDocumentItemIds;
    this.documentItemId = documentItemId.toLowerCase();
    this.systemPrompt = systemPrompt;
    this.temperature = Number(temperature);
    this.maxTokens = Number(maxTokens);
    this.userId = userId.toLowerCase();
    this.workflowId = workflowId.toLowerCase();
  }

  static fromInput(input: {
    stepIndex: number;
    rowIndex: number;
    stepName: string;
    assistantId: string;
    llmProvider: string;
    llmNameApi: string;
    inputDocumentItemIds: string[];
    documentItemId: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    userId: string;
    workflowId: string;
  }): AssistantJobDto {
    return new AssistantJobDto(
      input.stepIndex,
      input.rowIndex,
      input.stepName,
      input.assistantId,
      input.llmProvider,
      input.llmNameApi,
      input.inputDocumentItemIds,
      input.documentItemId,
      input.systemPrompt,
      input.temperature,
      input.maxTokens,
      input.userId,
      input.workflowId,
    );
  }
}
