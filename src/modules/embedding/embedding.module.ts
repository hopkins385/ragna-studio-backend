import { EmbeddingRepository } from './repositories/embedding.repository';
import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

@Module({
  providers: [EmbeddingRepository, EmbeddingService],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
