import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { TokenUsageModule } from '../token-usage/token-usage.module';

@Module({
  imports: [TokenUsageModule],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
