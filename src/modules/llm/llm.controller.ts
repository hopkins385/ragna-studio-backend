import { Controller, Get, NotFoundException } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get('models')
  async getAllModels() {
    try {
      const models = await this.llmService.getCachedModels();
      return { models };
    } catch (error) {
      throw new NotFoundException('Error fetching models');
    }
  }
}
