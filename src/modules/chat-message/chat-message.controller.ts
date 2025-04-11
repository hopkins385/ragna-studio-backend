import { IdParam } from '@/common/dto/cuid-param.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreateChatMessageBody, CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('chat')
export class ChatMessageController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':id/message')
  async create(
    @Param() param: IdParam,
    @Body() body: CreateChatMessageBody,
    @ReqUser() reqUser: RequestUser,
  ) {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }
    const payload = CreateChatMessageDto.fromInput({
      userId: reqUser.id,
      chatId,
      message: {
        type: body.message.type,
        role: body.message.role,
        // @ts-ignore
        content: body.message.content,
        visionContent: body.message.visionContent,
      },
    });

    try {
      return await this.chatService.createMessage(payload);
    } catch (error) {
      throw new InternalServerErrorException('Error creating message');
    }
  }
}
