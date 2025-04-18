import { BaseController } from '@/common/controllers/base.controller';
import { Controller, Get } from '@nestjs/common';
import { AssistantToolService } from './assistant-tool.service';

@Controller('assistant-tool')
export class AssistantToolController extends BaseController {
  constructor(private readonly assistantToolService: AssistantToolService) {
    super();
  }

  @Get('tools')
  async getAllTools() {
    try {
      const tools = await this.assistantToolService.findAll();
      return { tools };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
