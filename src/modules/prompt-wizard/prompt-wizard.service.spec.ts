import { Test, TestingModule } from '@nestjs/testing';
import { PromptWizardService } from './prompt-wizard.service';

describe('PromptWizardService', () => {
  let service: PromptWizardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptWizardService],
    }).compile();

    service = module.get<PromptWizardService>(PromptWizardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
