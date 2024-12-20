import { DocumentItem } from '@prisma/client';

export type DocumentWithItems = Document & {
  documentItems: DocumentItem[];
};
