import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DocumentItemService } from './document-item.service';
import { CreateDocumentItemDto } from './dto/create-document-item.dto';
import { UpdateDocumentItemDto } from './dto/update-document-item.dto';

@Controller('document-item')
export class DocumentItemController {
  constructor(private readonly documentItemService: DocumentItemService) {}
}
