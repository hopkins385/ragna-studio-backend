import { initDatabase } from './init-database.seed';
import { prismaSeedClient } from './seed.config';

initDatabase()
  .then(async () => {
    console.log('Database seeded successfully!');
    await prismaSeedClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaSeedClient.$disconnect();
    process.exit(1);
  });
