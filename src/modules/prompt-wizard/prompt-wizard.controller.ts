import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { PromptWizardService } from './prompt-wizard.service';

@Controller('prompt-wizard')
export class PromptWizardController {
  private readonly logger = new Logger(PromptWizardController.name);

  constructor(private readonly promptWizardService: PromptWizardService) {}

  @Post('create')
  async createPrompt(@ReqUser() reqUser: RequestUser, @Body() body: { input: string }) {
    const payload = {
      input: body.input,
      userId: reqUser.id,
    };

    try {
      const prompt = await this.promptWizardService.createPrompt(payload);
      return { prompt };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create prompt: ${error.message}`);
      }
      throw new InternalServerErrorException();
    }
  }
}
