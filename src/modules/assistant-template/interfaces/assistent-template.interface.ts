import type {
  PageNumberCounters,
  PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';
import type { AssistantTemplateEntity } from '../entities/assistant-template.entity';

export interface AssistantTemplatesPaginated {
  templates: AssistantTemplateEntity[];
  meta: PageNumberPagination & PageNumberCounters;
}
