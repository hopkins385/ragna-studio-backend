/**
 * ! Executing this script will delete all data in your database and seed it with 10 organisation.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://snaplet-seed.netlify.app/seed/integrations/prisma
 */
import type { SeedClient } from '@snaplet/seed';
import { createSeedClient } from '@snaplet/seed';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { copycat } from '@snaplet/copycat';
import { hashPassword } from './bcrypt';

async function seedLLMs(seed: SeedClient) {
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
  const llms = await seed.largeLangModel(prData);
  console.log('Seeded llms');
  return llms;
}

/*
async function seedDefaults(
  seed: SeedClient,
  payload: { orgId: string; firstTeamId: string; secondTeamId: string },
) {

  // seed assistant
  const { assistant } = await seedChatAssistants(
    llm[0].id,
    users[0].id,
    payload.firstTeamId,
    seed,
  );

  // add assistant to user favourites
  await seed.userFavorite([
    {
      id: createId(),
      userId: users[0].id,
      favoriteId: assistant[0].id,
      favoriteType: 'assistant',
    },
  ]);
  // seed chats for user
  const { chat: chats } = await seedChatsForUser(
    users[0].id,
    assistant[0].id,
    seed,
  );

  // seed chat messages for chat
  for (const chat of chats) {
    await seedChatMessagesForChat(chat.id, seed);
  }
}
  */

async function seedRoles(seed: SeedClient) {
  const roles = await seed.role([
    {
      id: createId(),
      name: 'admin',
    },
    {
      id: createId(),
      name: 'user',
    },
  ]);

  console.log('Seeded roles');

  return roles;
}

async function seedAssistantTools(seed: SeedClient) {
  const tools = [
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
  ];

  const aTools = await seed.tool(tools);
  console.log('Seeded tools');
  return aTools;
}

async function seedAssistantTemplates(seed: SeedClient) {
  // assistant template categories
  const aCategories = await seed.assistantTemplateCategory([
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
  ]);

  console.log('Seeded assistant template categories');
}

export async function initDatabase() {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const { role: roles } = await seedRoles(seed);

  const { largeLangModel: llms } = await seedLLMs(seed);

  const { tool: tools } = await seedAssistantTools(seed);

  // assistant Templates
  await seedAssistantTemplates(seed);

  return { roles, llms, tools };
}
