export class ChatMessageEntity {
  id: string;
  type: string;
  role: string;
  content: string;
  visionContent: string;
  tokenCount: number;
}
