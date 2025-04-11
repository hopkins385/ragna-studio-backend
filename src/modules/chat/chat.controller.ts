import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { FindAssistantDto } from '@/modules/assistant/dto/find-assistant.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatBody } from './dto/create-chat.dto';
import { GetAllChatsForUserDto } from './dto/get-all-chats.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly assistantService: AssistantService,
  ) {}

  @Get('history')
  async allPagniated(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    const { page, limit, searchQuery } = query;
    const payload = GetAllChatsForUserDto.fromInput({
      userId: reqUser.id,
      page,
      limit,
      searchQuery,
    });

    try {
      const [chats, meta] = await this.chatService.getAllForUserPaginate(payload);
      return { chats, meta };
    } catch (error) {
      throw new NotFoundException('Chats not found');
    }
  }

  @Get('all')
  async all(@ReqUser() reqUser: RequestUser) {
    try {
      const chats = await this.chatService.getAllForUser(reqUser.id);
      return { chats };
    } catch (error) {
      throw new NotFoundException('Chats not found');
    }
  }

  @Get('latest')
  async findLatest(@ReqUser() reqUser: RequestUser) {
    try {
      const chat = await this.chatService.getRecentForUser(reqUser.id);
      return { chat };
    } catch (error) {
      throw new NotFoundException('Chat not found');
    }
  }

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateChatBody) {
    const { assistantId } = body;
    const payload = FindAssistantDto.fromInput({ id: assistantId });

    try {
      const assistant = await this.assistantService.getOne(payload);

      if (!assistant) {
        throw new Error('Assistant not found with Id: ' + assistantId);
      }

      // access policy
      const canAccess = this.chatService.canCreateChatPolicy(reqUser, assistant);
      if (!canAccess) {
        throw new Error('Not allowed to create chat');
      }

      const chat = await this.chatService.create(assistantId, reqUser.id);
      return { chat };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new NotFoundException('Assistant not found');
    }
  }

  @Get(':id')
  async findById(@Param() param: IdParam, @ReqUser() reqUser: RequestUser) {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }

    try {
      const chat = await this.chatService.getChatForUser({
        chatId,
        userId: reqUser.id,
      });
      return { chat };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new NotFoundException('Chat not found');
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() updateChatDto: UpdateChatDto) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  async delete(
    @ReqUser() reqUser: RequestUser,
    @Param() param: IdParam,
  ): Promise<{ status: string }> {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }

    try {
      // find chat
      const chat = await this.chatService.getFirst(chatId);

      if (!chat) {
        throw new Error('Chat not found');
      }

      // access policy
      if (chat.userId !== reqUser.id) {
        throw new Error('Chat not found');
      }

      // await this.chatService.softDelete(chatId, user.id);
      await this.chatService.delete(chatId, reqUser.id);

      return { status: 'ok' };
    } catch (error) {
      throw new NotFoundException('Chat not found');
    }
  }

  @Delete(':id/messages')
  async deleteMessages(
    @Param() param: IdParam,
    @ReqUser() reqUser: RequestUser,
  ): Promise<{ status: string }> {
    const { id: chatId } = param;
    try {
      const chat = await this.chatService.getFirst(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // access policy
      if (chat.userId !== reqUser.id) {
        throw new Error('Chat not found');
      }

      await this.chatService.clearMessages(chatId);

      return { status: 'ok' };
    } catch (error) {
      throw new NotFoundException('Chat not found');
    }
  }
}
