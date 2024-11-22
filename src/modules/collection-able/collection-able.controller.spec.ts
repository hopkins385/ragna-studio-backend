import { Test, TestingModule } from '@nestjs/testing';
import { CollectionAbleController } from './collection-able.controller';

describe('CollectionAbleController', () => {
  let controller: CollectionAbleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionAbleController],
    }).compile();

    controller = module.get<CollectionAbleController>(CollectionAbleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
