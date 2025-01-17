import { SeedPrismaClient, prismaSeedClient } from './seed.config';
import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';

async function seedAssistantTemplateCategories(prisma: SeedPrismaClient) {
  const cats = await prisma.assistantTemplateCategory.createManyAndReturn({
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

  /*const subcats = await prisma.assistantTemplateCategory.createManyAndReturn({
    data: [
      {
        name: 'template.category.recommended.subcategory.title',
        description: 'template.category.recommended.subcategory.description',
        config: {
          icon: 'star',
          color: 'blue',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.recommended.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.business.subcategory.title',
        description: 'template.category.business.subcategory.description',
        config: {
          icon: 'briefcase',
          color: 'green',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.business.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.marketing.subcategory.title',
        description: 'template.category.marketing.subcategory.description',
        config: {
          icon: 'megaphone',
          color: 'red',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.marketing.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.social_media.subcategory.title',
        description: 'template.category.social_media.subcategory.description',
        config: {
          icon: 'share',
          color: 'yellow',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.social_media.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.education.subcategory.title',
        description: 'template.category.education.subcategory.description',
        config: {
          icon: 'graduation',
          color: 'purple',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.education.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'template.category.personal.subcategory.title',
        description: 'template.category.personal.subcategory.description',
        config: {
          icon: 'user',
          color: 'orange',
        },
        parentId: cats.find(
          (c) => c.name === 'template.category.personal.title',
        ).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  return cats.concat(subcats);
  */

  return cats;
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
      title: 'Text zusammen\u00ADfassen',
      description:
        'Vorgegebener Text wird in einen kurzen Text zusammengefasst.',
      assistantTitle: 'Text zusammen\u00ADfassen',
      assistantDescription:
        'Vorgegebener Text wird in einen kurzen Text zusammengefasst.',
      assistantSystemPrompt: {
        de: faker.lorem.sentence(),
        en: faker.lorem.sentence(),
      },
      assistantToolIds: [createId(), createId(), createId(), createId()],
      config: {
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: faker.color.human(),
        free: faker.datatype.boolean(),
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
