import { Module } from '@nestjs/common';
import { NerService } from './ner.service';
import { NerController } from './ner.controller';

@Module({
  controllers: [NerController],
  providers: [NerService],
})
export class NerModule {}
