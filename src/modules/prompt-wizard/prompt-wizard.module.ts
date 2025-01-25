import { Module } from '@nestjs/common';
import { PromptWizardService } from './prompt-wizard.service';
import { PromptWizardController } from './prompt-wizard.controller';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';

@Module({
  controllers: [PromptWizardController],
  providers: [AiModelFactory, PromptWizardService],
})
export class PromptWizardModule {}
