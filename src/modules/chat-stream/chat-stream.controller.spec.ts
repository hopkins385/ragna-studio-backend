import { Test } from '@nestjs/testing';
import { ChatStreamController } from './chat-stream.controller';
import { ChatStreamService } from './chat-stream.service';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat/chat.service';
import { AssistantToolFunctionService } from '../assistant-tool-function/assistant-tool-function.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PassThrough } from 'stream';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Socket } from 'net';
import { randomCUID2 } from '@/common/utils/random-cuid2';
import { ChatEntity } from '../chat/entities/chat.entity';
import { CreateChatStreamBody } from './dto/create-chat-stream-body.dto';

describe('ChatStreamController', () => {
  let chatStreamController: ChatStreamController;
  let chatStreamService: ChatStreamService;
  let chatService: ChatService;

  const userId = randomCUID2();
  const chatId = randomCUID2();
  const assistantId = randomCUID2();

  const mockUser = {
    id: userId,
    email: 'test@example.com',
  };

  const mockChat: ChatEntity = {
    id: chatId,
    userId: userId,
    assistantId: assistantId,
    title: 'Test Chat',
    messages: [],
    assistant: {
      id: assistantId,
      title: 'Test Assistant',
      hasKnowledgeBase: false,
      hasWorkflow: false,
      systemPrompt: 'You are a helpful assistant',
      tools: [{ tool: { functionId: 1 } }],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const createMockRequest = () =>
    ({
      on: jest.fn(),
      off: jest.fn(),
      socket: {
        on: jest.fn(),
        off: jest.fn(),
      } as unknown as Socket,
    }) as unknown as Request;

  const createMockResponse = () => {
    const stream = new PassThrough();
    const response = {
      on: jest
        .fn()
        .mockImplementation(
          (event: string, handler: (...args: any[]) => void) => {
            stream.on(event, handler);
            return response;
          },
        ),
      off: jest
        .fn()
        .mockImplementation(
          (event: string, handler: (...args: any[]) => void) => {
            stream.off(event, handler);
            return response;
          },
        ),
      once: jest
        .fn()
        .mockImplementation(
          (event: string, handler: (...args: any[]) => void) => {
            stream.once(event, handler);
            return response;
          },
        ),
      setHeader: jest.fn().mockReturnThis(),
      write: jest.fn().mockImplementation((chunk: any) => {
        stream.write(chunk);
        return true;
      }),
      end: jest.fn().mockImplementation(() => {
        stream.end();
        return response;
      }),
      emit: jest.fn().mockImplementation((event: string, ...args: any[]) => {
        stream.emit(event, ...args);
        return true;
      }),
      removeListener: jest.fn().mockReturnThis(),
      addListener: jest.fn().mockReturnThis(),
      prependListener: jest.fn().mockReturnThis(),
      eventNames: jest.fn().mockReturnValue([]),
      pipe: jest.fn().mockImplementation((dest) => dest),
      destroy: jest.fn(),
      statusCode: 200,
      getHeader: jest.fn(),
      writeHead: jest.fn().mockReturnThis(),
      stream,
    };

    // Add Writable stream methods
    response.write = jest.fn((chunk) => stream.write(chunk));
    response.end = jest.fn(() => stream.end());

    return response as unknown as Response & { stream: PassThrough };
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ChatStreamController],
      providers: [
        {
          provide: ChatStreamService,
          useValue: {
            createMessageStream: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ChatService,
          useValue: {
            getChatForUser: jest.fn(),
            formatChatMessages: jest.fn(),
          },
        },
        {
          provide: AssistantToolFunctionService,
          useValue: {},
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    chatStreamService = moduleRef.get(ChatStreamService);
    chatService = moduleRef.get(ChatService);
    chatStreamController = moduleRef.get(ChatStreamController);
  });

  describe('createChatMessageStream', () => {
    const mockBody: CreateChatStreamBody = {
      provider: 'openai' as any,
      model: 'gpt-3.5-turbo',
      messages: [],
      maxTokens: 1000,
      temperature: 70,
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should successfully create a chat message stream', async () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();

      const mockReadable = new PassThrough();
      mockReadable.write('test data');
      mockReadable.end();

      jest.spyOn(chatService, 'getChatForUser').mockResolvedValue(mockChat);
      jest
        .spyOn(chatStreamService, 'createMessageStream')
        .mockResolvedValue(mockReadable);
      jest.spyOn(chatService, 'formatChatMessages').mockReturnValue([]);

      await chatStreamController.createChatMessageStream(
        mockUser as any,
        mockRequest,
        mockResponse,
        { id: chatId },
        mockBody,
      );

      expect(chatService.getChatForUser).toHaveBeenCalledWith({
        chatId: chatId,
        userId: userId,
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream; charset=utf-8',
      );
    });

    it('should throw NotFoundException when chat is not found', async () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();

      jest.spyOn(chatService, 'getChatForUser').mockResolvedValue(null);

      await expect(
        chatStreamController.createChatMessageStream(
          mockUser as any,
          mockRequest,
          mockResponse,
          { id: 'nonexistent' },
          mockBody,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle stream pipeline errors', async () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();
      const error = new Error('Expected Pipeline error');

      jest.spyOn(chatService, 'getChatForUser').mockResolvedValue(mockChat);
      jest
        .spyOn(chatStreamService, 'createMessageStream')
        .mockRejectedValue(error);

      await expect(
        chatStreamController.createChatMessageStream(
          mockUser as any,
          mockRequest,
          mockResponse,
          { id: chatId },
          mockBody,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should properly clean up event listeners', async () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();

      const mockReadable = new PassThrough();
      mockReadable.write('test data');
      mockReadable.end();

      jest.spyOn(chatService, 'getChatForUser').mockResolvedValue(mockChat);
      jest
        .spyOn(chatStreamService, 'createMessageStream')
        .mockResolvedValue(mockReadable);

      await chatStreamController.createChatMessageStream(
        mockUser as any,
        mockRequest,
        mockResponse,
        { id: chatId },
        mockBody,
      );

      expect(mockRequest.off).toHaveBeenCalled();
      expect(mockResponse.off).toHaveBeenCalled();
      expect(mockRequest.socket.off).toHaveBeenCalled();
    });
  });
});
