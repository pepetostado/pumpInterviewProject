/*
 Wrapper (fetch) auth calls with Bearer token from localStorage when present.
 -- when 401: clears token + hard-navigates to /login (no apiFetch for login itself).
 -- returns res... caller handles JSON parsing and error status codes (like res.json())
*/

import { clearToken, getToken } from './auth.js';
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {

  const token = getToken();
  const reqHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: reqHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    clearToken();
    window.location.assign('/login');
    return new Promise(() => { });
  }

  return res;
}
