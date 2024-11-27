import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AssistantToolService } from './assistant-tool.service';

@Controller('assistant-tool')
export class AssistantToolController {
  constructor(private readonly assistantToolService: AssistantToolService) {}

  @Get('tools')
  async getAllTools() {
    try {
      const tools = await this.assistantToolService.findAll();
      return { tools };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching tools');
    }
  }
}
