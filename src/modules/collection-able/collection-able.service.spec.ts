import { Test, TestingModule } from '@nestjs/testing';
import { CollectionAbleService } from './collection-able.service';

describe('CollectionAbleService', () => {
  let service: CollectionAbleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionAbleService],
    }).compile();

    service = module.get<CollectionAbleService>(CollectionAbleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
