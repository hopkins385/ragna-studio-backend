import { BaseRepository } from '@/common/types/repository.types';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';

@Injectable()
export class ChatRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }
}
