import { BaseController } from '@/common/controllers/base.controller';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { PromptWizardService } from './prompt-wizard.service';

@Controller('prompt-wizard')
export class PromptWizardController extends BaseController {
  constructor(private readonly promptWizardService: PromptWizardService) {
    super();
  }

  @Post('create')
  async createPrompt(@ReqUser() reqUser: RequestUser, @Body() body: { input: string }) {
    try {
      const prompt = await this.promptWizardService.createPrompt({
        input: body.input,
        userId: reqUser.id,
      });
      return { prompt };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
