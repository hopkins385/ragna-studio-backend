import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAuthService } from './provider-auth.service';

describe('ProviderAuthService', () => {
  let service: ProviderAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderAuthService],
    }).compile();

    service = module.get<ProviderAuthService>(ProviderAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
