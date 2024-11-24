import { ReqUser } from '@/modules/user/decorators/user.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Logger,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatBody } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UserEntity } from '../user/entities/user.entity';
import { FindAssistantDto } from '../assistant/dto/find-assistant.dto';
import { AssistantService } from '../assistant/assistant.service';
import { GetAllChatsForUserDto } from './dto/get-all-chats.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly assistantService: AssistantService,
  ) {}

  @Get('history')
  async allPagniated(
    @ReqUser() user: UserEntity,
    @Query() query: PaginateQuery,
  ) {
    const { page, limit, searchQuery } = query;
    const payload = GetAllChatsForUserDto.fromInput({
      userId: user.id,
      page,
      limit,
      searchQuery,
    });
    const [chats, meta] = await this.chatService.getAllForUserPaginate(payload);
    return { chats, meta };
  }

  @Get('all')
  async all(@ReqUser() user: UserEntity) {
    const chats = await this.chatService.getAllForUser(user.id);
    return { chats };
  }

  @Get('latest')
  async findLatest(@ReqUser() user: UserEntity) {
    const chat = await this.chatService.getRecentForUser(user.id);
    return { chat };
  }

  @Post()
  async create(@ReqUser() user: UserEntity, @Body() body: CreateChatBody) {
    const { assistantId } = body;
    const payload = FindAssistantDto.fromInput({ id: assistantId });
    const assistant = await this.assistantService.findFirst(payload);

    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }

    // access policy
    const canAccess = this.chatService.canCreateChatPolicy(user, assistant);
    if (!canAccess) {
      throw new NotFoundException('Assistant not found');
    }

    const chat = await this.chatService.create(assistantId, user.id);
    return { chat };
  }

  @Get(':id')
  async findById(@Param() param: IdParam, @ReqUser() user: UserEntity) {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }

    try {
      const chat = await this.chatService.getChatForUser(chatId, user.id);
      return { chat };
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Chat not found');
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() updateChatDto: UpdateChatDto) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  async delete(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
  ): Promise<{ status: string }> {
    const { id: chatId } = param;
    if (!chatId) {
      throw new NotFoundException('Chat not found');
    }
    // find chat
    const chat = await this.chatService.getFirst(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // access policy
    if (chat.userId !== user.id) {
      throw new NotFoundException('Chat not found');
    }

    await this.chatService.softDelete(chatId, user.id);

    return { status: 'ok' };
  }

  @Delete(':id/messages')
  async deleteMessages(
    @Param() param: IdParam,
    @ReqUser() user: UserEntity,
  ): Promise<{ status: string }> {
    const { id: chatId } = param;
    const chat = await this.chatService.getFirst(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // access policy
    if (chat.userId !== user.id) {
      throw new NotFoundException('Chat not found');
    }

    await this.chatService.clearMessages(chatId);

    return { status: 'ok' };
  }
}
