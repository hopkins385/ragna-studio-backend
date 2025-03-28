export interface NerServerEntity {
  start: number;
  end: number;
  text: string;
  label: string;
  score: number;
}

export interface NerServerExtractResponse {
  masked_text: string;
  entities: NerServerEntity[];
}
