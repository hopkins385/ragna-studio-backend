import { SeedPrismaClient, prismaSeedClient } from './seed.config';
import { faker } from '@faker-js/faker';

async function seedAssistantTemplateCategories(prisma: SeedPrismaClient) {
  return prisma.assistantTemplateCategory.createManyAndReturn({
    data: [
      {
        name: 'template.category.recommended.title',
        description: 'template.category.recommended.description',
        config: {
          icon: 'star',
          color: 'blue',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.business.title',
        description: 'template.category.business.description',
        config: {
          icon: 'briefcase',
          color: 'green',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.marketing.title',
        description: 'template.category.marketing.description',
        config: {
          icon: 'megaphone',
          color: 'red',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.social_media.title',
        description: 'template.category.social_media.description',
        config: {
          icon: 'share',
          color: 'yellow',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.education.title',
        description: 'template.category.education.description',
        config: {
          icon: 'graduation',
          color: 'purple',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.personal.title',
        description: 'template.category.personal.description',
        config: {
          icon: 'user',
          color: 'orange',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
}

async function seedAssistantTemplates(prisma: SeedPrismaClient) {
  const icons = [
    'star',
    'briefcase',
    'megaphone',
    'share',
    'graduation',
    'user',
  ];
  const llms = await prisma.largeLangModel.findMany({});
  const llmsCount = llms.length;
  return prisma.assistantTemplate.createManyAndReturn({
    data: Array.from({ length: 100 }).map(() => ({
      llmId: llms[Math.floor(Math.random() * llmsCount)].id,
      title: faker.lorem.words(),
      description: faker.lorem.sentence(),
      systemPrompt: {
        de: faker.lorem.sentence(),
        en: faker.lorem.sentence(),
      },
      config: {
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: faker.color.human(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  });
}

async function assignTemplatesToCategories(
  prisma: SeedPrismaClient,
  templates: any[],
) {
  const categories = await prisma.assistantTemplateCategory.findMany({});
  const categoriesCount = categories.length;
  const templatesCount = templates.length;
  await prisma.assistantTemplateCategoryItem.createMany({
    data: Array.from({ length: templatesCount }).map(() => ({
      templateId: templates[Math.floor(Math.random() * templatesCount)].id,
      categoryId: categories[Math.floor(Math.random() * categoriesCount)].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  });
}

async function truncateAssistantTemplateData(prisma: SeedPrismaClient) {
  await prisma.assistantTemplateCategoryItem.deleteMany({});
  await prisma.assistantTemplateCategory.deleteMany({});
  await prisma.assistantTemplate.deleteMany({});
}

async function seedAssistantTemplatesData() {
  await truncateAssistantTemplateData(prismaSeedClient);
  await seedAssistantTemplateCategories(prismaSeedClient);
  const templates = await seedAssistantTemplates(prismaSeedClient);
  await assignTemplatesToCategories(prismaSeedClient, templates);
}

seedAssistantTemplatesData()
  .then(async () => {
    console.log('Database seeded successfully!');
    await prismaSeedClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaSeedClient.$disconnect();
    process.exit(1);
  });
