import { Controller, Get } from '@nestjs/common';
import { AssistantToolService } from './assistant-tool.service';

@Controller('assistant-tool')
export class AssistantToolController {
  constructor(private readonly assistantToolService: AssistantToolService) {}

  @Get('tools')
  async getAllTools() {
    const tools = await this.assistantToolService.findAll();
    return { tools };
  }
}
