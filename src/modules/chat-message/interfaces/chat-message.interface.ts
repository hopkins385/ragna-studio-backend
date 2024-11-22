import { ChatMessageRole } from '../enums/chat-message-role.enum';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageVisionContent } from './vision-image.interface';

export interface ChatMessage {
  type: ChatMessageType;
  role: ChatMessageRole;
  content: string;
  visionContent?: ChatMessageVisionContent[] | null | undefined;
}
