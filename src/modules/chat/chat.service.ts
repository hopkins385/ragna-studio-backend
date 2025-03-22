import { TokenizerService } from './../tokenizer/tokenizer.service';
import { Injectable, Logger } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { ChatMessage } from '@prisma/client';
import { GetAllChatsForUserDto } from './dto/get-all-chats.dto';
import { CreateChatMessageDto } from '../chat-message/dto/create-chat-message.dto';
import { VisionImageUrlContent } from '../chat-message/interfaces/vision-image.interface';
import { ChatEntity } from './entities/chat.entity';
import { UserEntity } from '../user/entities/user.entity';

function notLowerZero(value: number) {
  return value < 0 ? 0 : value;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly tokenizerService: TokenizerService,
    private readonly chatRepo: ChatRepository,
  ) {}

  public async getFirst(chatId: string | undefined) {
    if (!chatId) {
      return null;
    }
    return this.chatRepo.prisma.chat.findFirst({
      select: {
        id: true,
        title: true,
        userId: true,
      },
      where: {
        id: chatId.toLowerCase(),
      },
    });
  }

  public async getAllForUser(userId: string) {
    return this.chatRepo.prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  public async getRecentForUser(userId: string) {
    const chat = await this.chatRepo.prisma.chat.findFirst({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      where: {
        userId: userId.toLowerCase(),
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chat;
  }

  public async getAllForUserPaginate(payload: GetAllChatsForUserDto) {
    const { page, limit } = payload;
    if (!page || page < 1) {
      throw new Error('Invalid page number');
    }
    return this.chatRepo.prisma.chat
      .paginate({
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          assistant: {
            select: {
              id: true,
              title: true,
              llm: {
                select: {
                  provider: true,
                  displayName: true,
                },
              },
            },
          },
        },
        where: {
          userId: payload.userId,
          title: {
            contains: payload.searchQuery,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });
  }

  public async getChatForUser({
    chatId,
    userId,
  }: {
    chatId: string;
    userId: string;
  }): Promise<ChatEntity> {
    if (!chatId || !userId) {
      return null;
    }
    const chat = await this.chatRepo.prisma.chat.findFirstOrThrow({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        title: true,
        userId: true,
        // with messages relation
        messages: {
          select: {
            id: true,
            type: true,
            role: true,
            content: true,
            visionContent: true,
            tokenCount: true,
          },
          orderBy: {
            updatedAt: 'asc',
          },
        },
        assistant: {
          select: {
            id: true,
            title: true,
            systemPrompt: true,
            hasKnowledgeBase: true,
            hasWorkflow: true,
            tools: {
              select: {
                toolId: true,
                tool: {
                  select: {
                    id: true,
                    functionId: true,
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
            llm: {
              select: {
                id: true,
                provider: true,
                displayName: true,
                apiName: true,
                capabilities: true,
              },
            },
          },
        },
      },
      where: {
        id: chatId.toLowerCase(),
        userId,
        deletedAt: null,
      },
    });

    return new ChatEntity({
      id: chat.id,
      title: chat.title,
      assistantId: chat.assistant.id,
      userId: chat.userId,
      assistant: chat.assistant,
      messages: chat.messages as any, // TODO: fix type
    });
  }

  public async getChatAndCreditsForUser(chatId: string, userId: string) {
    if (!chatId || !userId) {
      return null;
    }
    return this.chatRepo.prisma.chat.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        title: true,
        user: {
          select: {
            id: true,
            totalCredits: true,
          },
        },
        assistant: {
          select: {
            id: true,
            systemPrompt: true,
            tools: {
              select: {
                toolId: true,
                tool: {
                  select: {
                    functionId: true,
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      where: {
        id: chatId.toLowerCase(),
        userId: userId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  public async create(assistantId: string, userId: string) {
    return this.chatRepo.prisma.chat.create({
      data: {
        title: 'Chat',
        user: {
          connect: {
            id: userId,
          },
        },
        assistant: {
          connect: {
            id: assistantId,
          },
        },
      },
    });
  }

  public async createMessage(payload: CreateChatMessageDto) {
    let tokenCount = 0;
    try {
      const { tokenCount: count } = await this.tokenizerService.getTokens(payload.message.content);
      tokenCount = count;
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      tokenCount = 0;
    }

    try {
      const res = await this.chatRepo.prisma.$transaction([
        // create message
        this.chatRepo.prisma.chatMessage.create({
          data: {
            chatId: payload.chatId,
            type: payload.message.type,
            role: payload.message.role,
            content: payload.message.content,
            visionContent: payload.message.visionContent,
            tokenCount,
          },
        }),
        // update chat updated at
        this.chatRepo.prisma.chat.update({
          where: {
            id: payload.chatId,
          },
          data: {
            updatedAt: new Date(),
          },
        }),
      ]);

      return res[0];
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
    }
  }

  public async createMessageAndReduceCredit(payload: CreateChatMessageDto) {
    let tokenCount = 0;

    try {
      const { tokenCount: count } = await this.tokenizerService.getTokens(payload.message.content);
      tokenCount = count;
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      tokenCount = 0;
    }

    try {
      const res = await this.chatRepo.prisma.$transaction([
        // create message
        this.chatRepo.prisma.chatMessage.create({
          data: {
            chatId: payload.chatId,
            type: payload.message.type,
            role: payload.message.role,
            content: payload.message.content,
            visionContent: payload.message.visionContent,
            tokenCount,
          },
        }),
        // TODO: enable reducing credit
        // reduce credit
        /*this.chatRepo.prisma.credit.update({
          where: {
            userId: payload.userId,
          },
          data: {
            amount: {
              decrement: 1,
            },
          },
        }),*/
        // update chat updated at
        this.chatRepo.prisma.chat.update({
          where: {
            id: payload.chatId,
          },
          data: {
            updatedAt: new Date(),
          },
        }),
      ]);

      return res[0];
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
    }
  }

  public async clearMessages(chatId: string) {
    return this.chatRepo.prisma.chatMessage.deleteMany({
      where: {
        chatId: chatId.toLowerCase(),
      },
    });
  }

  public async getChatMessages(chatId: string) {
    return this.chatRepo.prisma.chatMessage.findMany({
      where: {
        chatId: chatId.toLowerCase(),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  public async updateChatTitle(chatId: string, title: string) {
    return this.chatRepo.prisma.chat.update({
      where: {
        id: chatId.toLowerCase(),
        deletedAt: null,
      },
      data: {
        title,
      },
    });
  }

  public async softDelete(chatId: string, userId: string) {
    return this.chatRepo.prisma.chat.update({
      where: {
        id: chatId.toLowerCase(),
        userId: userId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async delete(chatId: string, userId: string) {
    return this.chatRepo.prisma.chat.delete({
      where: {
        id: chatId.toLowerCase(),
        userId,
      },
      include: {
        messages: true,
      },
    });
  }

  public async deleteAllChatsByUserId(userId: string) {
    return this.chatRepo.prisma.chat.deleteMany({
      where: {
        userId,
      },
    });
  }

  public async deleteChatMessagesByUserId(userId: string) {
    return this.chatRepo.prisma.chatMessage.deleteMany({
      where: {
        chat: {
          userId,
        },
      },
    });
  }

  /*
  public async getContextAwareSystemPrompt(payload: {
    assistantId: string;
    lastMessageContent: string;
    assistantSystemPrompt: string;
  }) {
    const collections = await this.collectionService.findAllWithRecordsFor(
      CollectionAbleDto.fromInput({
        id: payload.assistantId,
        type: 'assistant',
      }),
    );

    if (collections.length < 1) {
      return payload.assistantSystemPrompt;
    }

    const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();
    const res = await this.embeddingService.searchDocsByQuery({
      query: payload.lastMessageContent,
      recordIds,
    });

    const context = res.map((r) => r?.text || '').join('\n\n');

    return (
      payload.assistantSystemPrompt + '\n\n<context>' + context + '</context>'
    );
  }
  */

  // POLICIES

  canCreateChatPolicy(user: UserEntity, assistant: any): boolean {
    const { firstTeamId: userTeamId } = user;
    const {
      team: { id: assistantTeamId },
    } = assistant;

    if (assistantTeamId !== userTeamId) {
      return false;
    }

    return true;
  }

  canClearMessagesPolicy(user: UserEntity, chat: any) {
    const { id: userId } = user;
    const { userId: chatUserId } = chat;

    // check if the user is the owner of the chat
    if (chatUserId !== userId) {
      return false;
    }

    return true;
  }

  canDeletePolicy(user: UserEntity, chat: any) {
    const { id: userId } = user;
    const { userId: chatUserId } = chat;

    // check if the user is the owner of the chat
    if (chatUserId !== userId) {
      return false;
    }

    return true;
  }

  // UTILITIES

  getHistory(chat: any, totalAvailableTokens: number, requestedCompletionTokens: number) {
    if (!chat || !chat.messages) {
      throw new Error('Chat not found or has no messages');
    }
    const chatMessages = chat.messages;
    const messagesCount = chatMessages.length;
    const availableHistoryTokens = notLowerZero(totalAvailableTokens - requestedCompletionTokens);
    let tokenCount = 0;
    let i = messagesCount - 1; // start from the end of the array
    const messages = [];

    while (i > 0 && tokenCount <= availableHistoryTokens) {
      const message = chatMessages[i];
      tokenCount += message.tokenCount || 0;
      messages.push(message);
      i--;
    }

    return messages;
  }

  getLastChatMessage(messages: any[]) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      this.logger.error('No last message');
      throw new Error('No last message');
    }
    return lastMessage;
  }

  getVisionMessages(vis: VisionImageUrlContent[] | null | undefined) {
    if (!vis) {
      return [];
    }
    return vis.map((v) => {
      if (!v.url) throw new Error('VisionImageUrlContent url is required');
      return {
        type: 'image',
        image: new URL(v.url),
      };
    });
  }

  formatChatMessages(messages: ChatMessage[] | null | undefined) {
    if (!messages) {
      return [];
    }
    return messages.map((message) => {
      if (message.type === 'image' && message.visionContent) {
        const text = {
          type: 'text',
          text: message.content,
        };
        return {
          role: message.role,
          //@ts-ignore
          content: [text, ...this.getVisionMessages(message.visionContent)],
        };
      }
      return {
        role: message.role,
        content: message.content,
      };
    });
  }

  /*async getContextAwareSystemPrompt(payload: {
    assistantId: string;
    lastMessageContent: string;
    assistantSystemPrompt: string;
  }) {
    const timestamp = '\n\n' + 'Timestamp now(): ' + new Date().toISOString();

    const collections = await this.collectionService.findAllWithRecordsFor(
      CollectionAbleDto.fromInput({
        id: payload.assistantId,
        type: 'assistant',
      }),
    );

    if (collections.length < 1) {
      return payload.assistantSystemPrompt + timestamp;
    }

    const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();
    const res = await this.embeddingService.searchDocsByQuery({
      query: payload.lastMessageContent,
      recordIds,
    });

    const context = res.map((r) => r?.text || '').join('\n\n');

    return (
      payload.assistantSystemPrompt +
      '\n\n<context>' +
      context +
      '</context>' +
      timestamp
    );
  }*/
}
