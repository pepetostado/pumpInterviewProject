import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { badRequest, unauthorized } from '../lib/http.js';
import { signUserToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return badRequest(res);
  }

  const db = getDb();
  const user = db.data.users.find((u) => u.email === email);

  let ok =
    !!user &&
    user.isActive === true &&
    (await bcrypt.compare(password, user.passwordHash ?? ''));

  if (!ok) {
    return unauthorized(res);
  }

  try {
    const token = signUserToken(user._id);
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', requireAuth, (_req, res) => {
  // API stub only (no JWT blacklist). Real logout = client clears token — see pepe/sprint0/03-ui.md (S0-3).
  res.json({ ok: true });
});

export default router;
