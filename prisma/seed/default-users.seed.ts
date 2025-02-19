import { createId } from '@paralleldrive/cuid2';
import { hashPassword } from './bcrypt';
import { SeedPrismaClient, prismaSeedClient } from './seed.config';

async function defaultUsers(prisma: SeedPrismaClient) {
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD);
  const testerPassword = await hashPassword(process.env.TESTER_PASSWORD);
  // create user
  const users = await prisma.user.createManyAndReturn({
    data: [
      {
        id: createId(),
        name: 'Sven Stadhouders',
        firstName: 'Sven',
        lastName: 'Stadhouders',
        email: process.env.ADMIN_EMAIL,
        password: adminPassword,
        totalCredits: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        emailVerifiedAt: new Date(),
        onboardedAt: new Date(),
      },
      {
        id: createId(),
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: process.env.TESTER_EMAIL,
        password: testerPassword,
        totalCredits: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        emailVerifiedAt: new Date(),
        onboardedAt: new Date(),
      },
    ],
  });
  console.log('Seeded users');
  return users;
}

async function defaultOrganisations(seed: SeedPrismaClient) {
  const result = await seed.organisation.createManyAndReturn({
    data: [
      {
        id: createId(),
        name: 'Admin Organisation',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: createId(),
        name: 'Test Organisation',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });
  console.log('Seeded organisations');
  return result;
}

async function defaultTeams(seed: SeedPrismaClient, organisations: any[]) {
  const result = await seed.team.createManyAndReturn({
    data: [
      {
        id: createId(),
        organisationId: organisations[0].id,
        name: 'Admin Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: createId(),
        organisationId: organisations[1].id,
        name: 'Test Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });
  console.log('Seeded teams');
  return result;
}

async function teamUser(prisma: SeedPrismaClient, teams: any[], users: any[]) {
  await prisma.teamUser.createMany({
    data: [
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
    ],
  });
  console.log('Assigned users to teams');
}

async function truncate(prisma: SeedPrismaClient) {
  await prisma.teamUser.deleteMany();

  return Promise.all([
    prisma.organisation.deleteMany(),
    prisma.team.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedData(prisma: SeedPrismaClient) {
  const users = await defaultUsers(prisma);
  const organisations = await defaultOrganisations(prisma);
  const teams = await defaultTeams(prisma, organisations);
  await teamUser(prisma, teams, users);
}

async function seedDefaultUsers() {
  await truncate(prismaSeedClient);
  await seedData(prismaSeedClient);
}

seedDefaultUsers()
  .then(async () => {
    console.log('Database seeded successfully!');
    await prismaSeedClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaSeedClient.$disconnect();
    process.exit(1);
  });
