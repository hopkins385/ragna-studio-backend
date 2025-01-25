import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { PromptWizardService } from './prompt-wizard.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('prompt-wizard')
export class PromptWizardController {
  private readonly logger = new Logger(PromptWizardController.name);

  constructor(private readonly promptWizardService: PromptWizardService) {}

  @Post('create')
  async createPrompt(
    @ReqUser() user: UserEntity,
    @Body() body: { input: string },
  ) {
    const payload = {
      input: body.input,
      userId: user.id,
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
