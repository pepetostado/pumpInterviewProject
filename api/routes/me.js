import { Router } from 'express';
import { getDb } from '../db/index.js';
import { badRequest, sanitizeUser, unauthorized } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const PATCH_WHITELIST = new Set([
  'name',
  'phone',
  'address',
  'age',
  'company',
  'eyeColor',
]);

router.use(requireAuth);

function findUser(db, userId) {
  return db.data.users.find((u) => u._id === userId);
}

router.get('/', (req, res) => {
  const db = getDb();
  const user = findUser(db, req.userId);
  if (!user) {
    return unauthorized(res);
  }
  res.json(sanitizeUser(user));
});

router.patch('/', async (req, res) => {
  const db = getDb();
  const user = findUser(db, req.userId);
  if (!user) {
    return unauthorized(res);
  }

  const body = req.body ?? {};
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return res.json(sanitizeUser(user));
  }

  for (const key of keys) {
    if (!PATCH_WHITELIST.has(key)) {
      return badRequest(res);
    }
  }

  for (const key of keys) {
    user[key] = body[key];
  }

  await db.write();
  res.json(sanitizeUser(user));
});

export default router;
