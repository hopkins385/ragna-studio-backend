import { BaseController } from '@/common/controllers/base.controller';
import { NerExtractBody } from '@/modules/ner/dto/ner-exctract-body.dto';
import { NerExtractResult } from '@/modules/ner/interfaces/ner-extract-result.interface';
import { Body, Controller, Post } from '@nestjs/common';
import { NerService } from './ner.service';

/**
 * Controller for Named Entity Recognition (NER).
 */
@Controller('ner')
export class NerController extends BaseController {
  constructor(private readonly nerService: NerService) {
    super();
  }

  @Post('extract')
  async extractEntities(@Body() body: NerExtractBody): Promise<NerExtractResult> {
    try {
      const response = await this.nerService.extractEntities({
        text: body.text,
        labels: body.labels,
      });
      return response;
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
