import { Test, TestingModule } from '@nestjs/testing';
import { CacheManagerController } from './cache-manager.controller';

describe('CacheManagerController', () => {
  let controller: CacheManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheManagerController],
    }).compile();

    controller = module.get<CacheManagerController>(CacheManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
