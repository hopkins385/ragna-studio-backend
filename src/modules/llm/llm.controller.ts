import { BaseController } from '@/common/controllers/base.controller';
import { Controller, Get } from '@nestjs/common';
import { LlmListResponseDto } from './dto/llm-list-response.dto';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController extends BaseController {
  constructor(private readonly llmService: LlmService) {
    super();
  }

  @Get('models')
  async getAllModels() {
    try {
      const models = await this.llmService.getCachedModels();
      return LlmListResponseDto.from(models);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
