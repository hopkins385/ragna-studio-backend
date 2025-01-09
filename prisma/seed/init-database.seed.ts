/**
 * ! Executing this script will delete all data in your database and seed it with 10 organisation.
 * ! Make sure to adjust the script to your needs.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { prismaSeedClient, type SeedPrismaClient } from './seed.config';

async function seedLLMs(prisma: SeedPrismaClient) {
  const path = join(__dirname, 'llm_providers.json');
  const data = readFileSync(path, 'utf8');
  const providers = JSON.parse(data);
  const prData: any[] = [];
  for (const provider of providers) {
    prData.push({
      id: createId(),
      provider: provider.provider,
      apiName: provider.apiName,
      description: provider.description,
      displayName: provider.displayName,
      hidden: provider.hidden,
      free: provider.free,
      capabilities: provider.capabilities,
      infos: provider.infos,
      deletedAt: null,
    });
  }
  const llms = await prisma.largeLangModel.createMany({
    data: prData,
  });
  console.log('Seeded llms');
  return llms;
}

async function seedRoles(prisma: SeedPrismaClient) {
  const roles = await prisma.role.createMany({
    data: [
      {
        id: createId(),
        name: 'admin',
      },
      {
        id: createId(),
        name: 'user',
      },
    ],
  });
  console.log('Seeded roles');
  return roles;
}

async function seedAssistantTools(prisma: SeedPrismaClient) {
  const aTools = await prisma.tool.createMany({
    data: [
      {
        id: createId(),
        functionId: 4,
        functionName: 'directions',
        name: 'Google Maps',
        description: 'Get directions to a location',
        iconName: 'map',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 3,
        functionName: 'imageGenerator',
        name: 'Image Generator',
        description: 'Generate images',
        iconName: 'image',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 2,
        functionName: 'website',
        name: 'Visit Website',
        description: 'Get the content of a website',
        iconName: 'web',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 1,
        functionName: 'searchWeb',
        name: 'Web Search',
        description: 'Search the web',
        iconName: 'search',
        deletedAt: null,
      },
    ],
  });
  console.log('Seeded tools');
  return aTools;
}

async function seedAssistantTemplates(prisma: SeedPrismaClient) {
  // assistant template categories
  const aCategories = await prisma.assistantTemplateCategory.createMany({
    data: [
      {
        id: createId(),
        name: 'General',
        description: 'General purpose templates',
      },
      {
        id: createId(),
        name: 'Weather',
        description: 'Templates for weather',
      },
      {
        id: createId(),
        name: 'News',
        description: 'Templates for news',
      },
      {
        id: createId(),
        name: 'Search',
        description: 'Templates for search',
      },
      {
        id: createId(),
        name: 'Social Media',
        description: 'Templates for social media',
      },
      {
        id: createId(),
        name: 'Utilities',
        description: 'Templates for utilities',
      },
    ],
  });

  console.log('Seeded assistant template categories');
}

async function truncate(prisma: SeedPrismaClient) {
  await Promise.all([
    prisma.largeLangModel.deleteMany({}),
    prisma.role.deleteMany({}),
    prisma.tool.deleteMany({}),
    prisma.assistantTool.deleteMany({}),
    prisma.assistantTemplate.deleteMany({}),
  ]);
  console.log('Truncated llms, roles, tools and assistant templates');
}

export async function initDatabase() {
  // Truncate all tables in the database
  await truncate(prismaSeedClient);

  const roles = await seedRoles(prismaSeedClient);
  const llms = await seedLLMs(prismaSeedClient);
  const tools = await seedAssistantTools(prismaSeedClient);

  // assistant Templates
  await seedAssistantTemplates(prismaSeedClient);

  return { roles, llms, tools };
}
