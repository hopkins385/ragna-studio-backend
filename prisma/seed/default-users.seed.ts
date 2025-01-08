import type { SeedClient } from '@snaplet/seed';
import { createSeedClient } from '@snaplet/seed';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { copycat } from '@snaplet/copycat';
import { hashPassword } from './bcrypt';

async function defaultUsers(seed: SeedClient) {
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
  const users = await seed.user(data);
  console.log('Seeded users');
  return users;
}

async function defaultTeams(seed: SeedClient) {
  const data = [
    {
      id: createId(),
      name: 'Admin Team',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: createId(),
      name: 'Test Team',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];
  const teams = await seed.team(data);
  console.log('Seeded teams');
  return teams;
}

export async function seedData(seed: SeedClient) {
  const { user: users } = await defaultUsers(seed);
  const { team: teams } = await defaultTeams(seed);

  await seed.teamUser([
    {
      id: createId(),
      teamId: teams[0].id,
      userId: users[0].id,
      deletedAt: null,
    },
    {
      id: createId(),
      teamId: teams[1].id,
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
}

export async function seedDefaultUsers() {
  const seed = await createSeedClient();
  await seedData(seed);
}
