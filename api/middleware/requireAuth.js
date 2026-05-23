import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../lib/jwt.js';
import { unauthorized } from '../lib/http.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return unauthorized(res);
  }

  const raw = header.slice('Bearer '.length).trim();
  if (!raw) {
    return unauthorized(res);
  }

  let decoded;
  try {
    decoded = jwt.verify(raw, getJwtSecret());
  } catch {
    return unauthorized(res);
  }

  const sub = decoded?.sub;
  if (typeof sub !== 'string' || !sub) {
    return unauthorized(res);
  }

  req.userId = sub;
  next();
}
