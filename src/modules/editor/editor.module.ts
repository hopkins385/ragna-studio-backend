import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';

@Module({
  controllers: [EditorController],
  providers: [AiModelFactory, EditorService],
})
export class EditorModule {}
