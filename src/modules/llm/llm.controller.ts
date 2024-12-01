import { Controller, Get, Logger, NotFoundException } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmListResponse } from './dto/llm-list-response.dto';

@Controller('llm')
export class LlmController {
  private readonly logger = new Logger(LlmController.name);

  constructor(private readonly llmService: LlmService) {}

  @Get('models')
  async getAllModels() {
    try {
      const models = await this.llmService.getCachedModels();
      return LlmListResponse.from(models);
    } catch (error: any) {
      this.logger.error(
        `Error fetching models: ${error?.message}`,
        error?.stack,
      );
      throw new NotFoundException('No llms found');
    }
  }
}
