import { NerServerEntity } from '@/modules/ner/interfaces/ner-server-response.interface';

export interface NerExtractResult {
  maskedText: string;
  entities: NerServerEntity[];
}
