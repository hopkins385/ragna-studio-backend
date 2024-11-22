import { Module } from '@nestjs/common';
import { DocumentItemService } from './document-item.service';
import { DocumentItemController } from './document-item.controller';
import { DocumentItemRepository } from './repositories/document-item.repository';

@Module({
  controllers: [DocumentItemController],
  providers: [DocumentItemRepository, DocumentItemService],
  exports: [DocumentItemService],
})
export class DocumentItemModule {}
