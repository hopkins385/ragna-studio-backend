import { Test, TestingModule } from '@nestjs/testing';
import { PromptWizardController } from './prompt-wizard.controller';
import { PromptWizardService } from './prompt-wizard.service';

describe('PromptWizardController', () => {
  let controller: PromptWizardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptWizardController],
      providers: [PromptWizardService],
    }).compile();

    controller = module.get<PromptWizardController>(PromptWizardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
