import { Body, Controller, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorCompletionBody } from './dto/editor-completion-body.dto';
import { EditorCompletionDto } from './dto/editor-completion.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { InlineCompletionBody } from '@/modules/editor/dto/editor-inline-completion-body.dto';

@Controller('editor')
export class EditorController {
  private readonly logger = new Logger(EditorController.name);

  constructor(private readonly editorService: EditorService) {}

  @Post('completion')
  async completion(@ReqUser() user: UserEntity, @Body() body: EditorCompletionBody) {
    const editorCompletionDto = EditorCompletionDto.fromInput({
      userId: user.id,
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
  async inlineCompletion(@ReqUser() user: UserEntity, @Body() body: InlineCompletionBody) {
    const inlineCompletionDto = {
      userId: user.id,
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
