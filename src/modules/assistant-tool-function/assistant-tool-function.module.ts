import { Module } from '@nestjs/common';
import { AssistantToolFunctionService } from './assistant-tool-function.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [AssistantToolFunctionService],
})
export class AssistantToolFunctionModule {}
