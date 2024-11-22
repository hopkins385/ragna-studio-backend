import { Test, TestingModule } from '@nestjs/testing';
import { ChatStreamService } from './chat-stream.service';

describe('ChatStreamService', () => {
  let service: ChatStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatStreamService],
    }).compile();

    service = module.get<ChatStreamService>(ChatStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
