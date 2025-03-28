export interface NerExtractResponse {
  masked_text: string;
  entities: {
    start: number;
    end: number;
    text: string;
    label: string;
    score: number;
  }[];
}
