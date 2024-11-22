import { Test, TestingModule } from '@nestjs/testing';
import { ChatToolService } from './chat-tool.service';

describe('ChatToolService', () => {
  let service: ChatToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatToolService],
    }).compile();

    service = module.get<ChatToolService>(ChatToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
