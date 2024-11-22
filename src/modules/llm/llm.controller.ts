import { Controller, Get } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get('models')
  async getAllModels() {
    const models = await this.llmService.getCachedModels();
    return { models };
  }
}
