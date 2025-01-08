import { seedDefaultUsers } from './index';

seedDefaultUsers()
  .then(() => {
    console.log('Default users seeded successfully!');
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
