import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { CollectionRepository } from './repositories/collection.repository';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  controllers: [CollectionController],
  providers: [CollectionRepository, CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
