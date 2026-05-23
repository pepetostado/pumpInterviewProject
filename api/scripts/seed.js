import { seedFromFile } from '../db/index.js';

const result = await seedFromFile();

if (result.seeded) {
  console.log(`Seeded ${result.count} users`);
} else {
  console.log(`Already seeded (${result.count} users)`);
}
