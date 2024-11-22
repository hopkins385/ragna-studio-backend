import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './repositories/document.repository';

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [DocumentRepository, DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
