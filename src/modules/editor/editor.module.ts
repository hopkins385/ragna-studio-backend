import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { TokenUsageModule } from '@/modules/token-usage/token-usage.module';
import { LlmModule } from '@/modules/llm/llm.module';

@Module({
  imports: [TokenUsageModule, LlmModule],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
