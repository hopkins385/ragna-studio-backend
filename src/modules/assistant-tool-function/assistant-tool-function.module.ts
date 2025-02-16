import { Module } from '@nestjs/common';
import { AssistantToolFunctionService } from './assistant-tool-function.service';
import { EmbeddingModule } from '@/modules/embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [AssistantToolFunctionService],
  exports: [AssistantToolFunctionService],
})
export class AssistantToolFunctionModule {}
