import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { JSONFilePreset } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA = { users: [] };

let db;

function getDbPath() {
  return process.env.DB_PATH ?? join(__dirname, 'db.json');
}

export function resetDbForTests() {
  db = undefined;
}

export async function initDb() {
  if (!db) {
    db = await JSONFilePreset(getDbPath(), DEFAULT_DATA);
  }
  await db.read();
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function resolveSeedPath() {
  if (process.env.SEED_USERS_PATH) {
    return process.env.SEED_USERS_PATH;
  }
  return join(__dirname, '../../data/users.json');
}

export function needsSeed(users = []) {
  if (!users.length) {
    return true;
  }
  return users.some((user) => Object.hasOwn(user, 'password'));
}

export async function seedFromFile(seedPath = resolveSeedPath()) {
  const database = await initDb();
  const users = database.data?.users ?? [];

  if (!needsSeed(users)) {
    return { seeded: false, count: users.length };
  }

  const { users: sourceUsers } = JSON.parse(await readFile(seedPath, 'utf8'));
  const hashedUsers = await Promise.all(
    sourceUsers.map(async ({ password, ...rest }) => ({
      ...rest,
      passwordHash: await bcrypt.hash(password, 10),
    })),
  );

  database.data = { users: hashedUsers };
  await database.write();

  return { seeded: true, count: hashedUsers.length };
}

export async function ensureSeeded() {
  return seedFromFile();
}
