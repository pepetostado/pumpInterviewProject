# S0-2 · auth API

Refs: [`constitution.md`](../constitution.md) (routes, valid user), [`edgeCases.md`](edgeCases.md).

## Goal

`POST /api/auth/login`, `GET /api/me`, `PATCH /api/me` (+ optional logout stub). Uniform 401 on login failure.

## Checklist

- [ ] `express.json()` on app
- [ ] `POST /api/auth/login` — body `{ email, password }`, bcrypt compare, `isActive === true`, JWT `sub: _id`
- [ ] `requireAuth` — `Authorization: Bearer`, verify `JWT_SECRET`, set `req.userId`
- [ ] `GET /api/me` — profile + balance; strip password/hash from response
- [ ] `PATCH /api/me` — whitelist only (see PLAN.md); reject `balance`, `_id`, `password` → **400**; empty body → **200** no-op
- [ ] (optional) `POST /api/auth/logout` — 200 stub
- [ ] Login failures: unknown email, bad pw, inactive (Boyd) → all **401**, same shape
- [ ] curl: Henderson active → `{ token }`
- [ ] curl: Boyd / bad pw / fake email → 401
- [ ] curl: `/api/me` with token → 200; without → 401

## Done when

All constitution API routes (except optional logout) work through `http://localhost:82/api/...`.
