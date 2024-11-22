import { Test, TestingModule } from '@nestjs/testing';
import { TextToImageService } from './text-to-image.service';

describe('TextToImageService', () => {
  let service: TextToImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextToImageService],
    }).compile();

    service = module.get<TextToImageService>(TextToImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
