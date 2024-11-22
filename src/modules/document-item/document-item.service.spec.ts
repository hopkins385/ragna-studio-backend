import { Test, TestingModule } from '@nestjs/testing';
import { DocumentItemService } from './document-item.service';

describe('DocumentItemService', () => {
  let service: DocumentItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentItemService],
    }).compile();

    service = module.get<DocumentItemService>(DocumentItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
