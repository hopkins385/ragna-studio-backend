import { ApiRequest } from '@/common/interfaces/request.interface';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';

export interface ChatRequest extends ApiRequest {
  chat: ChatEntity;
}
