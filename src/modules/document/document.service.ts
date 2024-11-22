import { Injectable } from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FindAllDocumentsDto } from './dto/find-all-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly docRepo: DocumentRepository) {}

  async create(payload: CreateDocumentDto) {
    const document = await this.docRepo.prisma.document.create({
      data: {
        teamId: payload.teamId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return document;
  }

  async createMany(payload: CreateDocumentDto[]) {
    return this.docRepo.prisma.document.createMany({
      data: payload.map((item) => ({
        teamId: item.teamId,
        name: item.name,
        description: item.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  }

  findFirst(teamId: string, documentId: string) {
    return this.docRepo.prisma.document.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        updatedAt: true,
        createdAt: true,
        documentItems: {
          select: {
            id: true,
            content: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        id: documentId.toLowerCase(),
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findAll(payload: FindAllDocumentsDto) {
    return this.docRepo.prisma.document
      .paginate({
        where: {
          teamId: payload.teamId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
        includePageCount: true,
      });
  }

  findMany() {
    return this.docRepo.prisma.document.findMany();
  }

  update(payload: UpdateDocumentDto) {
    return this.docRepo.prisma.document.update({
      where: {
        id: payload.documentId,
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  updateMany(payload: UpdateDocumentDto[]) {
    return this.docRepo.prisma.document.updateMany({
      where: {
        id: {
          in: payload.map((item) => item.documentId),
        },
      },
      data: payload.map((item) => ({
        name: item.name,
        description: item.description,
        updatedAt: new Date(),
      })),
    });
  }

  softDelete(documentId: string) {
    return this.docRepo.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  delete(documentId: string) {
    return this.docRepo.prisma.document.delete({
      where: {
        id: documentId.toLowerCase(),
      },
    });
  }

  async deleteAllDocumentsByTeamId(teamId: string) {
    return this.docRepo.prisma.document.deleteMany({
      where: {
        teamId: teamId.toLowerCase(),
      },
    });
  }

  addDocumentItem(documentId: string, documentItemId: string) {
    return this.docRepo.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        documentItems: {
          connect: {
            id: documentItemId.toLowerCase(),
          },
        },
      },
    });
  }

  removeDocumentItem(documentId: string, documentItemId: string) {
    return this.docRepo.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        documentItems: {
          disconnect: {
            id: documentItemId.toLowerCase(),
          },
        },
      },
    });
  }

  async parse(documentId: string) {
    throw new Error('Method not implemented.');
    // first get the document
    /*const document = await this.findFirst(documentId);
    if (!document || !document.filePath || !document.fileName || !document.fileExtension) {
      throw new Error('Document not found or missing file path, name or extension');
    }
    const path = `${document.filePath}/${document.fileName}`;
    const parser = new FileParserFactory(document.fileExtension, path);
    const data = await parser.loadData();
    return data;*/
  }

  addWorkflow(documentId: string, workflowId: string) {
    //
    throw new Error('Method not implemented.');
  }

  removeWorkflow(documentId: string, workflowId: string) {
    //
    throw new Error('Method not implemented.');
  }
}
