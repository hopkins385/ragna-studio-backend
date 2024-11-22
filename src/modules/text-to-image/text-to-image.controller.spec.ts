import { Test, TestingModule } from '@nestjs/testing';
import { TextToImageController } from './text-to-image.controller';
import { TextToImageService } from './text-to-image.service';

describe('TextToImageController', () => {
  let controller: TextToImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextToImageController],
      providers: [TextToImageService],
    }).compile();

    controller = module.get<TextToImageController>(TextToImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
