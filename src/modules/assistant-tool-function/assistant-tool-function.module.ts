import { Module } from '@nestjs/common';
import { AssistantToolFunctionService } from './assistant-tool-function.service';
import { EmbeddingModule } from '@/modules/embedding/embedding.module';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [EmbeddingModule, CollectionModule],
  providers: [AssistantToolFunctionService],
  exports: [AssistantToolFunctionService],
})
export class AssistantToolFunctionModule {}
