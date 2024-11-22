import { Test, TestingModule } from '@nestjs/testing';
import { DocumentItemController } from './document-item.controller';
import { DocumentItemService } from './document-item.service';

describe('DocumentItemController', () => {
  let controller: DocumentItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentItemController],
      providers: [DocumentItemService],
    }).compile();

    controller = module.get<DocumentItemController>(DocumentItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
