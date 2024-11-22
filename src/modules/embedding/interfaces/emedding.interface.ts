type Vector = number[];
export type Embedding = Vector;

export interface IEmbedFilePayload {
  mediaId: string;
  recordId: string;
  mimeType: string;
  filePath: string;
}

export interface SearchResultDocument {
  mediaId: string;
  recordId: string;
  text: string;
}

export interface RagDocument {
  id: string;
  text: string;
  metadata: {
    mediaId: string;
    recordId: string;
  };
}
