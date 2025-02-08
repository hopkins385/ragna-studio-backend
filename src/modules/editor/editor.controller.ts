import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorCompletionBody } from './dto/editor-completion-body.dto';

@Controller('editor')
export class EditorController {
  private readonly logger = new Logger(EditorController.name);

  constructor(private readonly editorService: EditorService) {}

  @Post('completion')
  async completion(@Body() body: EditorCompletionBody) {
    try {
      const completion = await this.editorService.completion(body);
      return { completion };
      //
    } catch (error: any) {
      this.logger.error(`Error in completion: ${error?.message}`);
      throw new InternalServerErrorException();
    }
  }
}
