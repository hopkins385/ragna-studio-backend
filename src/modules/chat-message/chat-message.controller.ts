import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import {
  CreateChatMessageBody,
  CreateChatMessageDto,
} from './dto/create-chat-message.dto';
import { ChatService } from '../chat/chat.service';
import { IdParam } from '@/common/dto/cuid-param.dto';

@Controller('chat')
export class ChatMessageController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':id/message')
  async create(
    @Param() param: IdParam,
    @Body() body: CreateChatMessageBody,
    @ReqUser() user: UserEntity,
  ) {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }
    const payload = CreateChatMessageDto.fromInput({
      userId: user.id,
      chatId,
      message: {
        type: body.message.type,
        role: body.message.role,
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
