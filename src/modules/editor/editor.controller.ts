import { InlineCompletionBody } from '@/modules/editor/dto/editor-inline-completion-body.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { EditorCompletionBody } from './dto/editor-completion-body.dto';
import { EditorCompletionDto } from './dto/editor-completion.dto';
import { EditorService } from './editor.service';

@Controller('editor')
export class EditorController {
  private readonly logger = new Logger(EditorController.name);

  constructor(private readonly editorService: EditorService) {}

  @Post('completion')
  async completion(@ReqUser() reqUser: RequestUser, @Body() body: EditorCompletionBody) {
    const editorCompletionDto = EditorCompletionDto.fromInput({
      userId: reqUser.id,
      instructions: body.prompt,
      selectedText: body.selectedText,
      context: body.context,
    });
    try {
      const { completion } = await this.editorService.completion(editorCompletionDto);
      return { completion };
      //
    } catch (error: any) {
      this.logger.error(`Error in completion: ${error?.message}`);
      throw new InternalServerErrorException();
    }
  }

  @Post('inline-completion')
  async inlineCompletion(@ReqUser() reqUser: RequestUser, @Body() body: InlineCompletionBody) {
    const inlineCompletionDto = {
      userId: reqUser.id,
      textContext: body.textContext,
    };
    try {
      const result = await this.editorService.inlineCompletion(inlineCompletionDto);
      return { inlineCompletion: result.inlineCompletion };
    } catch (error: any) {
      this.logger.error(`Error in inline-completion: ${error?.message}`);
      throw new InternalServerErrorException();
    }
  }
}
