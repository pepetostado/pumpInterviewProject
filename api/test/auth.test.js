// login (post), me (get,patch), logout (post) built with gemini 3 flash (just fyI)
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import {
  resetDbForTests,
  seedFromFile,
} from '../db/index.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const seedPath = join(fixtureDir, 'users.json');

let tempDir;
let dbPath;

function listen(serverApp) {
  return new Promise((resolve) => {
    const srv = serverApp.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port =
        typeof addr === 'object' && addr?.port !== undefined ? addr.port : null;
      resolve({
        srv,
        origin: `http://127.0.0.1:${port}`,
      });
    });
  });
}

async function login(origin, email, password) {
  const res = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res;
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'smartpump-auth-'));
  dbPath = join(tempDir, 'db.json');
  process.env.DB_PATH = dbPath;
  process.env.SEED_USERS_PATH = seedPath;
  process.env.JWT_SECRET = 'test-secret';
  resetDbForTests();
  await seedFromFile(seedPath);
});

afterEach(async () => {
  delete process.env.DB_PATH;
  delete process.env.SEED_USERS_PATH;
  delete process.env.JWT_SECRET;
  resetDbForTests();
  await rm(tempDir, { recursive: true, force: true });
});

describe('POST /api/auth/login', () => {
  it('returns token for active user with correct credentials', async () => {
    const { srv, origin } = await listen(app);
    try {
      const res = await login(origin, 'active@test.com', 'secret123');
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(typeof data.token, 'string');
      assert.ok(data.token.length > 0);
      const decoded = jwt.verify(data.token, 'test-secret');
      assert.equal(decoded.sub, 'test-active');
    } finally {
      srv.close();
    }
  });

  it('returns 401 with same shape for inactive user', async () => {
    const { srv, origin } = await listen(app);
    try {
      const inactive = await login(origin, 'inactive@test.com', 'other456');
      assert.equal(inactive.status, 401);

      const wrongPw = await login(origin, 'active@test.com', 'nope');
      assert.equal(wrongPw.status, 401);

      const unknown = await login(origin, 'ghost@test.com', 'x');
      assert.equal(unknown.status, 401);

      assert.deepEqual(await inactive.clone().json(), { error: 'Unauthorized' });
      assert.deepEqual(await wrongPw.clone().json(), { error: 'Unauthorized' });
      assert.deepEqual(await unknown.clone().json(), { error: 'Unauthorized' });
    } finally {
      srv.close();
    }
  });

  it('returns 400 when email or password missing or not strings', async () => {
    const { srv, origin } = await listen(app);
    try {
      let res = await fetch(`${origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Bad Request' });

      res = await fetch(`${origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'active@test.com' }),
      });
      assert.equal(res.status, 400);
    } finally {
      srv.close();
    }
  });
});

describe('GET /api/me', () => {
  it('returns 401 without Bearer, with garbage bearer, expired jwt', async () => {
    const { srv, origin } = await listen(app);
    try {
      let res = await fetch(`${origin}/api/me`);
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'Unauthorized' });

      res = await fetch(`${origin}/api/me`, {
        headers: { Authorization: 'Bearer garbage' },
      });
      assert.equal(res.status, 401);

      const expired = jwt.sign({ sub: 'test-active' }, 'test-secret', {
        expiresIn: '-10s',
      });
      res = await fetch(`${origin}/api/me`, {
        headers: { Authorization: `Bearer ${expired}` },
      });
      assert.equal(res.status, 401);
    } finally {
      srv.close();
    }
  });

  it('returns sanitized profile including balance when token valid', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      const res = await fetch(`${origin}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.balance, '$100.00');
      assert.equal(body._id, 'test-active');
      assert.ok(!Object.hasOwn(body, 'password'));
      assert.ok(!Object.hasOwn(body, 'passwordHash'));
    } finally {
      srv.close();
    }
  });
});

describe('PATCH /api/me', () => {
  it('rejects forbidden top-level keys with 400', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      for (const body of [
        { balance: '$999.99' },
        { _id: 'hijack' },
        { password: 'x' },
        { passwordHash: '$2a$x' },
        { email: 'new@test.com' },
      ]) {
        const res = await fetch(`${origin}/api/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        assert.equal(res.status, 400, JSON.stringify(body));
        assert.deepEqual(await res.json(), { error: 'Bad Request' });
      }
    } finally {
      srv.close();
    }
  });

  it('rejects blank or invalid whitelisted values with 400', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      for (const body of [
        { phone: '' },
        { phone: '   ' },
        { name: { first: '', last: 'User' } },
        { name: { first: 'Active', last: '  ' } },
        { age: '' },
        { age: 0 },
        { age: 1.5 },
        { company: '\t' },
      ]) {
        const res = await fetch(`${origin}/api/me`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body),
        });
        assert.equal(res.status, 400, JSON.stringify(body));
        assert.deepEqual(await res.json(), { error: 'Bad Request' });
      }
    } finally {
      srv.close();
    }
  });

  it('mixed allowed and forbidden returns 400', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      const res = await fetch(`${origin}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: '+9', balance: '$0' }),
      });
      assert.equal(res.status, 400);
    } finally {
      srv.close();
    }
  });

  it('empty body keeps balance on disk', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      const before = JSON.parse(await readFile(dbPath, 'utf8'));

      const res = await fetch(`${origin}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 200);
      const after = JSON.parse(await readFile(dbPath, 'utf8'));
      assert.deepEqual(after.users[0].balance, before.users[0].balance);
      const payload = await res.json();
      assert.equal(payload.phone, '+1 (111) 000-0001');
    } finally {
      srv.close();
    }
  });

  it('applied whitelist fields persist', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      const res = await fetch(`${origin}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: '+1 (999) 111-2233',
          company: 'NEWDROP',
          age: 31,
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.phone, '+1 (999) 111-2233');
      assert.equal(body.company, 'NEWDROP');
      assert.equal(body.age, 31);

      const snapshot = JSON.parse(await readFile(dbPath, 'utf8'));
      const persisted = snapshot.users.find((u) => u._id === 'test-active');
      assert.equal(persisted.phone, '+1 (999) 111-2233');
    } finally {
      srv.close();
    }
  });
});

describe('POST /api/auth/logout', () => {
  it('returns ok with valid token and 401 without', async () => {
    const { srv, origin } = await listen(app);
    try {
      const lr = await login(origin, 'active@test.com', 'secret123');
      const { token } = await lr.json();

      const res = await fetch(`${origin}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { ok: true });

      let out = await fetch(`${origin}/api/auth/logout`, { method: 'POST' });
      assert.equal(out.status, 401);
      out = await fetch(`${origin}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: 'Bearer x' },
      });
      assert.equal(out.status, 401);
    } finally {
      srv.close();
    }
  });
});
