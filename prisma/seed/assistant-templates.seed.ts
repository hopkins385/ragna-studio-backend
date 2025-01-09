import { truncate } from 'node:fs';
import { SeedPrismaClient, prismaSeedClient } from './seed.config';

async function seedAssistantTemplateCategories(prisma: SeedPrismaClient) {
  return prisma.assistantTemplateCategory.createManyAndReturn({
    data: [
      {
        name: 'General',
        description: 'General purpose templates',
      },
      {
        name: 'Health',
        description: 'Templates for health and wellness',
      },
      {
        name: 'Work',
        description: 'Templates for work and productivity',
      },
      {
        name: 'Personal',
        description: 'Templates for personal use',
      },
      {
        name: 'Relationships',
        description: 'Templates for relationships',
      },
    ],
  });
}

async function seedAssistantTemplates(prisma: SeedPrismaClient) {
  const llms = await prisma.largeLangModel.findMany({});
  const llmsCount = llms.length;
  return prisma.assistantTemplate.createManyAndReturn({
    data: [
      {
        llmId: llms[Math.floor(Math.random() * llmsCount)].id,
        title: 'template.assistant.general',
        description: 'template.assistant.general.description',
        systemPrompt: {
          de: 'Hallo! Wie kann ich Ihnen helfen?',
          en: 'Hello! How can I help you?',
        },
      },
    ],
  });
}

async function assignTemplatesToCategories(
  prisma: SeedPrismaClient,
  templates: any[],
) {
  const categories = await prisma.assistantTemplateCategory.findMany({});
  const categoriesCount = categories.length;
  const templatesCount = templates.length;
  const templateCategoryAssignments = [];
  for (let i = 0; i < templatesCount; i++) {
    templateCategoryAssignments.push({
      templateId: templates[i].id,
      categoryId: categories[Math.floor(Math.random() * categoriesCount)].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await prisma.assistantTemplateCategoryItem.createMany({
    data: templateCategoryAssignments,
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
