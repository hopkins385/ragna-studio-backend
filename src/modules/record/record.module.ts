import { RecordRepository } from './repositories/record.repository';
import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { MediaModule } from '../media/media.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [MediaModule, EmbeddingModule],
  controllers: [RecordController],
  providers: [RecordRepository, RecordService],
  exports: [RecordService],
})
export class RecordModule {}
