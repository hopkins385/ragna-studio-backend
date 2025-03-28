import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { NerService } from './ner.service';
import { NerExtractBody } from '@/modules/ner/dto/ner-exctract-body.dto';
import { NerExtractResult } from '@/modules/ner/interfaces/ner-extract-result.interface';

/**
 * Controller for Named Entity Recognition (NER).
 */
@Controller('ner')
export class NerController {
  constructor(private readonly nerService: NerService) {}

  @Post('extract')
  async extractEntities(@Body() body: NerExtractBody): Promise<NerExtractResult> {
    try {
      const response = await this.nerService.extractEntities({
        text: body.text,
        labels: body.labels,
      });
      return response;
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to extract entities');
    }
  }
}
