import { PrismaClient } from '@prisma/client';
import cuid2Extension from 'prisma-extension-cuid2';
import { pagination } from 'prisma-extension-pagination';

export function getExtendedPrismaClient(url: string) {
  const extendedPrismaClient = new PrismaClient({
    log: ['info', 'warn', 'error'], // , 'query'
    datasources: {
      db: {
        url,
      },
    },
  })
    .$extends(cuid2Extension())
    .$extends(pagination());

  return extendedPrismaClient;
}

export type ExtendedPrismaClient = ReturnType<typeof getExtendedPrismaClient>;
