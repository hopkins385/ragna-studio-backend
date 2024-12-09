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
  return await seed.largeLangModel(prData);
}

async function seedOrganisations(seed: SeedClient) {
  return await seed.organisation((x) =>
    x(10, (ctx) => ({
      id: createId(),
      name: copycat.words(ctx.seed),
      description: copycat.sentence(ctx.seed),
      deletedAt: null,
    })),
  );
}

async function seedTeams(orgId: string, seed: SeedClient) {
  return await seed.team((x) =>
    x(10, (ctx) => ({
      id: createId(),
      name: copycat.words(ctx.seed),
      organisationId: orgId,
      deletedAt: null,
      // create for each team 10 users
      team_users: (x) =>
        x(10, (ctx1) => ({
          id: createId(),
          deletedAt: null,
          users: (ctx2) => ({
            id: createId(),
            firstName: copycat.firstName(ctx2.seed),
            lastName: copycat.lastName(ctx2.seed),
            name: copycat.fullName(ctx2.seed),
            email: copycat.email(ctx2.seed),
            deletedAt: null,
          }),
        })),
    })),
  );
}

async function seedDefaultUsers(seed: SeedClient) {
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD);
  const testerPassword = await hashPassword(process.env.TESTER_PASSWORD);
  // create user
  const data = [
    {
      id: createId(),
      name: 'Sven Stadhouders',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      emailVerified: new Date(),
    },
    {
      id: createId(),
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: process.env.TESTER_EMAIL,
      password: testerPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      emailVerified: new Date(),
    },
  ];
  return await seed.user(data);
}

async function seedDefaults(
  seed: SeedClient,
  payload: { orgId: string; firstTeamId: string; secondTeamId: string },
) {
  const { user: users } = await seedDefaultUsers(seed);

  // add default users to team
  await seed.teamUser([
    {
      id: createId(),
      teamId: payload.firstTeamId,
      userId: users[0].id,
      deletedAt: null,
    },
    {
      id: createId(),
      teamId: payload.secondTeamId,
      userId: users[1].id,
      deletedAt: null,
    },
  ]);

  // credits for each default user
  await seed.credit([
    {
      id: createId(),
      userId: users[0].id,
      amount: 1000,
    },
    {
      id: createId(),
      userId: users[1].id,
      amount: 1000,
    },
  ]);

  // Seed the database with roles

  const { role } = await seedRoles(seed);

  // connect user with role
  await seed.userRole([
    {
      id: createId(),
      userId: users[0].id,
      roleId: role[0].id,
    },
    {
      id: createId(),
      userId: users[1].id,
      roleId: role[0].id,
    },
  ]);

  // seed llms
  const { largeLangModel: llm } = await seedLLMs(seed);

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

async function seedRoles(seed: SeedClient) {
  return await seed.role([
    {
      id: createId(),
      name: 'admin',
    },
    {
      id: createId(),
      name: 'user',
    },
  ]);
}

async function seedFirstUser(seed: SeedClient) {
  // seed first user
  const password = await hashPassword('password');
  const { user } = await seed.user([
    {
      id: createId(),
      name: 'Sven Stadhouders',
      deviceId: '',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: 'sven@ragna-ai.com',
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      emailVerified: new Date(),
      onboardedAt: null,
    },
  ]);

  console.log('User seeded:', user);

  return user;
}

async function seedChatAssistants(
  llmId: string,
  userId: string,
  teamId: string,
  seed: SeedClient,
) {
  return await seed.assistant((x) =>
    x(1, (ctx) => ({
      id: createId(),
      llmId,
      teamId,
      name: 'Assistant',
      description: 'The assistant',
      systemPrompt: 'You are a friendly assistant',
      userId,
      deletedAt: null,
    })),
  );
}

async function seedChatsForUser(
  userId: string,
  assistantId: string,
  seed: SeedClient,
) {
  return await seed.chat((x) =>
    x(40, (ctx) => ({
      id: createId(),
      assistantId,
      userId,
      title: copycat.words(ctx.seed),
      description: copycat.sentence(ctx.seed),
      deletedAt: null,
    })),
  );
}

async function seedChatMessagesForChat(chatId: string, seed: SeedClient) {
  return await seed.chatMessage((x) =>
    x(10, (ctx) => ({
      id: createId(),
      chatId,
      content: copycat.sentence(ctx.seed),
      // alternating between user and assistant
      role: ctx.index % 2 === 0 ? 'user' : 'assistant',
      timestamp: new Date(),
      isComplete: true,
      usage: null,
    })),
  );
}

async function assignUserToRoles(
  seed: SeedClient,
  userId: string,
  roleIds: string[],
) {
  return await seed.userRole(
    roleIds.map((roleId) => ({
      id: createId(),
      userId,
      roleId,
    })),
  );
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

  return await seed.tool(tools);
}

async function main() {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  // Seed the database with large language models
  // const { largeLangModel: llm } = await seedLLMs(seed);

  /*
  // seed roles
  const { role: roles } = await seedRoles(seed);

  // Seed the database with admin user
  const user = await seedFirstUser(seed);

  // seed assistant
  const { assistant } = await chatAssistant(llm[0].id, seed);

  // seed chats for user
  const { chat: chats } = await seedChatsForUser(
    user[0].id,
    assistant[0].id,
    seed,
  );

  // seed chat messages for chat
  for (const chat of chats) {
    await seedChatMessagesForChat(chat.id, seed);
  }

  // assign user to roles
  await assignUserToRoles(
    seed,
    user[0].id,
    roles.map((r) => r.id),
  );
  */

  const { tool } = await seedAssistantTools(seed);

  // Seed the database with 10 organisations
  const { organisation } = await seedOrganisations(seed);

  // create for each organisation 10 teams
  const teams = [];
  for (const org of organisation) {
    const { team } = await seedTeams(org.id, seed);
    teams.push(team);
  }

  const firstTeam = teams[0][0];
  const secondTeam = teams[0][1];

  // Seed the database with default users and so on
  const data = {
    orgId: organisation[0].id,
    firstTeamId: firstTeam.id,
    secondTeamId: secondTeam.id,
  };
  await seedDefaults(seed, data);
}

main()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
