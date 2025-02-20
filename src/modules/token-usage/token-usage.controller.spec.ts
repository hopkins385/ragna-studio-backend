import { Test, TestingModule } from '@nestjs/testing';
import { TokenUsageController } from './token-usage.controller';

describe('TokenUsageController', () => {
  let controller: TokenUsageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenUsageController],
    }).compile();

    controller = module.get<TokenUsageController>(TokenUsageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
