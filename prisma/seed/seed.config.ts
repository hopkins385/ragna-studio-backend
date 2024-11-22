import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';
import cuid2Extension from 'prisma-extension-cuid2';
// import { envPath } from '../../src/config/base.config';

// require('dotenv').config(envPath);

export default defineConfig({
  adapter: () => {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }).$extends(cuid2Extension());
    return new SeedPrisma(client);
  },
  select: ['!*_prisma_migrations'],
});
