/**
 * Unified auth error responses (uniform 401 body).
 */

export function unauthorized(res) {
  return res.status(401).json({ error: 'Unauthorized' });
}

export function badRequest(res) {
  return res.status(400).json({ error: 'Bad Request' });
}

export function sanitizeUser(user) {
  const out = { ...user };
  delete out.password;
  delete out.passwordHash;
  return out;
}
