import { Injectable } from '@nestjs/common';
import { DocumentItemRepository } from './repositories/document-item.repository';
import { CreateDocumentItemDto } from './dto/create-document-item.dto';
import { UpdateDocumentItemDto } from './dto/update-document-item.dto';
import { DocumentProcessingStatus } from './interfaces/processing-status.interface';

@Injectable()
export class DocumentItemService {
  constructor(private readonly docItemRepo: DocumentItemRepository) {}

  create(payload: CreateDocumentItemDto) {
    return this.docItemRepo.prisma.documentItem.create({
      data: {
        documentId: payload.documentId,
        orderColumn: payload.orderColumn,
        status: payload.status,
        type: payload.type,
        content: payload.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  createMany(payload: CreateDocumentItemDto[]) {
    return this.docItemRepo.prisma.documentItem.createMany({
      data: payload.map((item) => ({
        documentId: item.documentId,
        orderColumn: item.orderColumn,
        status: item.status,
        type: item.type,
        content: item.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  }

  findFirst(documentItemId: string) {
    return this.docItemRepo.prisma.documentItem.findFirst({
      where: {
        id: documentItemId.toLowerCase(),
      },
    });
  }

  findMany(documentId: string) {
    return this.docItemRepo.prisma.documentItem.findMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  findManyItems(documentItemIds: string[]) {
    return this.docItemRepo.prisma.documentItem.findMany({
      where: {
        id: {
          in: documentItemIds.map((id) => id.toLowerCase()),
        },
      },
      select: {
        id: true,
        content: true,
        document: {
          select: {
            id: true,
            name: true,
            workflowSteps: {
              select: {
                id: true,
                name: true,
                orderColumn: true,
              },
            },
          },
        },
      },
    });
  }

  update(payload: UpdateDocumentItemDto) {
    return this.docItemRepo.prisma.documentItem.update({
      where: {
        id: payload.documentItemId.toLowerCase(),
      },
      data: {
        content: payload.content,
        orderColumn: payload.orderColumn,
        status: payload.status,
        type: payload.type,
        updatedAt: new Date(),
      },
    });
  }

  updateProcessingStatus(
    documentItemId: string,
    processingStatus: DocumentProcessingStatus,
  ) {
    return this.docItemRepo.prisma.documentItem.update({
      where: {
        id: documentItemId.toLowerCase(),
      },
      data: {
        processingStatus: processingStatus.toLowerCase(),
        updatedAt: new Date(),
      },
    });
  }

  updateMany(payload: UpdateDocumentItemDto[]) {
    return this.docItemRepo.prisma.documentItem.updateMany({
      where: {
        id: {
          in: payload.map((item) => item.documentItemId),
        },
      },
      data: payload.map((item) => ({
        orderColumn: item.orderColumn,
        status: item.status,
        type: item.type,
        content: item.content,
        updatedAt: new Date(),
      })),
    });
  }

  delete(documentItemId: string) {
    return this.docItemRepo.prisma.documentItem.delete({
      where: {
        id: documentItemId.toLowerCase(),
      },
    });
  }

  deleteMany(documentId: string) {
    return this.docItemRepo.prisma.documentItem.deleteMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  softDelete(documentItemId: string) {
    return this.docItemRepo.prisma.documentItem.update({
      where: {
        id: documentItemId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  softDeleteMany(documentId: string) {
    return this.docItemRepo.prisma.documentItem.updateMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
