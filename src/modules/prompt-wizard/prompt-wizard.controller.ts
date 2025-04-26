import { BaseController } from '@/common/controllers/base.controller';
import { CreatePromptBody } from '@/modules/prompt-wizard/dto/create-prompt-body.dto';
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
  async createPrompt(@ReqUser() reqUser: RequestUser, @Body() body: CreatePromptBody) {
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
