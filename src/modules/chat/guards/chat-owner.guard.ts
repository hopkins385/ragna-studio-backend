import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ChatService } from './../chat.service';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';

@Injectable()
export class ChatOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly chatService: ChatService,
  ) {}

  private validateUser(
    user: UserEntity,
    chat: ChatEntity,
    isShareable: boolean,
  ): boolean {
    const { userId } = chat;
    return user.id === userId;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isShareable = false;
    // const isShareable = this.reflector.getAllAndOverride<boolean>(
    //   IS_SHAREABLE_KEY,
    //   [context.getHandler(), context.getClass()],
    // );
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { id: chatId } = request.params;
    if (!user || !chatId) {
      throw new UnprocessableEntityException();
    }
    const chat = (await this.chatService.getFirst(chatId)) as ChatEntity; // TODO: Make proper return type
    const result = this.validateUser(user, chat, isShareable);
    if (!result) {
      return false;
    }
    request.chat = chat;
    return true;
  }
}
