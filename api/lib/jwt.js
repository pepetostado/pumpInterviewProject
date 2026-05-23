import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
}

export function signUserToken(sub) {
  return jwt.sign({ sub }, getJwtSecret(), { expiresIn: '7d' });
}
