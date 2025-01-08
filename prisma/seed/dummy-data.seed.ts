import type { SeedClient } from '@snaplet/seed';
import { createSeedClient } from '@snaplet/seed';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { copycat } from '@snaplet/copycat';
import { hashPassword } from './bcrypt';

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
