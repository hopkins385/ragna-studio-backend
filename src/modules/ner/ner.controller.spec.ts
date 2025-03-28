import { Test, TestingModule } from '@nestjs/testing';
import { NerController } from './ner.controller';
import { NerService } from './ner.service';

describe('NerController', () => {
  let controller: NerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NerController],
      providers: [NerService],
    }).compile();

    controller = module.get<NerController>(NerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
