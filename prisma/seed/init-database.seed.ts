/**
 * ! Executing this script will delete all data in your database and seed it with 10 organisation.
 * ! Make sure to adjust the script to your needs.
 */
import { createId } from '@paralleldrive/cuid2';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
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
        name: 'platform_owner',
      },
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
        functionId: 1,
        functionName: 'websearch',
        name: 'websearch',
        description: 'Search the web',
        iconName: 'globe',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 2,
        functionName: 'webscraper',
        name: 'webscraper',
        description: 'Get the content of a website',
        iconName: 'website',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 3,
        functionName: 'knowledge',
        name: 'knowledge',
        description: 'Search in the connected knowledge base',
        iconName: 'database',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 4,
        functionName: 'texteditor',
        name: 'texteditor',
        description: 'Edit text',
        iconName: 'pencil',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 5,
        functionName: 'think',
        name: 'think',
        description: 'Think about something',
        iconName: 'brain',
        deletedAt: null,
      },
      {
        id: createId(),
        functionId: 6,
        functionName: 'directions',
        name: 'directions',
        description:
          'Get directions between two or more locations and optional including waypoints',
        iconName: 'directions',
        deletedAt: null,
      },
    ],
  });
  console.log('Seeded tools');
  return aTools;
}

async function truncate(prisma: SeedPrismaClient) {
  await Promise.all([
    prisma.largeLangModel.deleteMany({}),
    prisma.role.deleteMany({}),
    prisma.tool.deleteMany({}),
    prisma.assistantTool.deleteMany({}),
    prisma.assistantTemplate.deleteMany({}),
    prisma.assistantTemplateCategory.deleteMany({}),
    prisma.assistantTemplateCategoryItem.deleteMany({}),
  ]);
  console.log('Truncated llms, roles, assistantTools, assistantTemplates');
}

async function confirmDatabaseSeed(): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await new Promise<string>((resolve) => {
      console.log('\n⚠️  Warning: Initial database seed');
      console.log('All Users, LLMs, AssistantTemplates, etc. will be deleted!\n');

      rl.question('Are you sure you want to continue? (yes/no): ', (input) => {
        resolve(input);
        rl.close();
      });
    });

    return answer.toLowerCase().trim() === 'yes';
  } catch (error) {
    rl.close();
    return false;
  }
}

export async function initDatabase() {
  // const confirm = await confirmDatabaseSeed();
  // if (!confirm) {
  //   console.log('❌ Operation cancelled');
  //   process.exit(0);
  // }
  // Truncate all tables in the database
  await truncate(prismaSeedClient);

  const roles = await seedRoles(prismaSeedClient);
  const llms = await seedLLMs(prismaSeedClient);
  const tools = await seedAssistantTools(prismaSeedClient);

  return { roles, llms, tools };
}
