import { PrismaClient } from '@prisma/client';
import cuid2Extension from 'prisma-extension-cuid2';

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends(cuid2Extension());
}

export type SeedPrismaClient = ReturnType<typeof createPrismaClient>;

export const prismaSeedClient = createPrismaClient();
