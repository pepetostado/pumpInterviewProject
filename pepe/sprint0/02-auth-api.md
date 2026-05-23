# S0-2 · auth API

Refs: [`constitution.md`](../constitution.md) (routes, valid user), [`edgeCases.md`](edgeCases.md).

## Goal

`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`, `PATCH /api/me`. Uniform 401 on credential login failure.

## Checklist

- [x] `express.json()` on app
- [x] `POST /api/auth/login` — body `{ email, password }`, bcrypt compare, `isActive === true`, JWT `sub: _id`
- [x] `requireAuth` — `Authorization: Bearer`, verify `JWT_SECRET`, set `req.userId`
- [x] `GET /api/me` — profile + balance; strip password/hash from response
- [x] `PATCH /api/me` — whitelist only (see PLAN.md); reject forbidden keys and blank/invalid values → **400**; empty body `{}` → **200** no-op
- [x] `POST /api/auth/logout` — 200 `{ ok: true }` (requires auth)
- [x] Login failures: unknown email, bad pw, inactive (Boyd) → all **401**, same shape
- [x] curl: Henderson active → `{ token }`
- [x] curl: Boyd / bad pw / fake email → 401
- [x] curl: `/api/me` with token → 200; without → 401

## Done when

All constitution API routes work through `http://localhost:82/api/...`.
