import { AssistantWithRelations } from '@/modules/assistant/interfaces/assistant.interface';
import { DocumentWithItems } from '@/modules/document/interfaces/document.interface';
import { WorkflowStep } from '@prisma/client';

export type WorkflowStepWithRelations = WorkflowStep & {
  assistant: AssistantWithRelations;
  document: DocumentWithItems;
};
