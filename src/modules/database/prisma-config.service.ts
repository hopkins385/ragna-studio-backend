import { Injectable } from '@nestjs/common';
import { CustomPrismaClientFactory } from 'nestjs-prisma';
import {
  type ExtendedPrismaClient,
  getExtendedPrismaClient,
} from './prisma.extension';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExtendedPrismaConfigService
  implements CustomPrismaClientFactory<ExtendedPrismaClient>
{
  constructor(private readonly config: ConfigService) {}

  createPrismaClient(): ExtendedPrismaClient {
    // you could pass options to your `PrismaClient` instance here
    return getExtendedPrismaClient(this.config.get<string>('DATABASE_URL'));
  }
}
