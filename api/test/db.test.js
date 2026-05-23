// built with gemini 3 flash (just fyI)

/* 
tests:
- needsSeed
- seedFromFile
- getDb
*/
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, it } from 'node:test';
import bcrypt from 'bcryptjs';
import {
  getDb,
  initDb,
  needsSeed,
  resetDbForTests,
  seedFromFile,
} from '../db/index.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const seedPath = join(fixtureDir, 'users.json');

let tempDir;
let dbPath;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'smartpump-db-'));
  dbPath = join(tempDir, 'db.json');
  process.env.DB_PATH = dbPath;
  process.env.SEED_USERS_PATH = seedPath;
  resetDbForTests();
});

afterEach(async () => {
  delete process.env.DB_PATH;
  delete process.env.SEED_USERS_PATH;
  resetDbForTests();
  await rm(tempDir, { recursive: true, force: true });
});

describe('needsSeed', () => {
  it('returns true when users array is empty', () => {
    assert.equal(needsSeed([]), true);
  });

  it('returns false when users only have passwordHash', () => {
    assert.equal(
      needsSeed([{ _id: '1', email: 'a@test.com', passwordHash: '$2a$10$abc' }]),
      false,
    );
  });

  it('returns true when any user still has a password field', () => {
    assert.equal(
      needsSeed([
        { _id: '1', passwordHash: '$2a$10$abc' },
        { _id: '2', password: 'leaked' },
      ]),
      true,
    );
  });
});

describe('seedFromFile', () => {
  it('writes hashed users without password field', async () => {
    const result = await seedFromFile(seedPath);

    assert.equal(result.seeded, true);
    assert.equal(result.count, 2);

    const onDisk = JSON.parse(await readFile(dbPath, 'utf8'));
    assert.equal(onDisk.users.length, 2);
    assert.ok(onDisk.users.every((u) => !Object.hasOwn(u, 'password')));
    assert.ok(
      onDisk.users.every(
        (u) =>
          typeof u.passwordHash === 'string' && u.passwordHash.startsWith('$2'),
      ),
    );
    assert.ok(onDisk.users.every((u) => u.email));
    assert.ok(onDisk.users.every((u) => u.balance));
  });

  it('passwordHash verifies against source plaintext', async () => {
    await seedFromFile(seedPath);

    const source = JSON.parse(await readFile(seedPath, 'utf8'));
    const database = await initDb();

    for (const sourceUser of source.users) {
      const stored = database.data.users.find((u) => u._id === sourceUser._id);
      assert.ok(stored);
      assert.equal(
        await bcrypt.compare(sourceUser.password, stored.passwordHash),
        true,
      );
    }
  });

  it('is idempotent on second run', async () => {
    const first = await seedFromFile(seedPath);
    const second = await seedFromFile(seedPath);

    assert.equal(first.seeded, true);
    assert.equal(second.seeded, false);
    assert.equal(second.count, 2);

    const firstHash = (await initDb()).data.users[0].passwordHash;
    const secondHash = (await initDb()).data.users[0].passwordHash;
    assert.equal(firstHash, secondHash);
  });

  it('re-seeds when db still contains plaintext password', async () => {
    await writeFile(
      dbPath,
      JSON.stringify({
        users: [
          {
            _id: 'bad',
            email: 'bad@test.com',
            password: 'plaintext',
          },
        ],
      }),
      'utf8',
    );
    resetDbForTests();

    const result = await seedFromFile(seedPath);
    assert.equal(result.seeded, true);

    const onDisk = JSON.parse(await readFile(dbPath, 'utf8'));
    assert.equal(onDisk.users.length, 2);
    assert.ok(onDisk.users.every((u) => !Object.hasOwn(u, 'password')));
  });
});

describe('getDb', () => {
  it('throws if database was not initialized', () => {
    assert.throws(() => getDb(), /not initialized/);
  });
});
