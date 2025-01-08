import { initDatabase } from './init-database.seed';

initDatabase()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
