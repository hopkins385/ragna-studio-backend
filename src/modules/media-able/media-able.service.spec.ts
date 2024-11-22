import { Test, TestingModule } from '@nestjs/testing';
import { MediaAbleService } from './media-able.service';

describe('MediaAbleService', () => {
  let service: MediaAbleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaAbleService],
    }).compile();

    service = module.get<MediaAbleService>(MediaAbleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
