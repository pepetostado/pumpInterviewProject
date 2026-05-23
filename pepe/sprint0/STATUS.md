# Sprint 0 — status

Living handoff doc: what is done, what is next. Update when a track ships.

**Source of truth for rules:** [`../constitution.md`](../constitution.md)

---

## Done

### Infra (pre–S0-1)

- [x] Docker dev stack — api (`node --watch`), client (`next dev`), nginx → **http://localhost:82**
- [x] Docker prod — multistage Dockerfiles, `docker-compose.prod.yml`, client `volumes: !reset []`
- [x] `/api/health` → `{ ok: true }` through nginx
- [x] Client scaffold — Next.js App Router, Tailwind
- [x] `Makefile` — `dev`, `dev-down`, `prod`, `prod-down`, `logs`, `test-api`, `smoke-auth`
- [x] `env.example` — `JWT_SECRET`, `NEXT_PUBLIC_API_URL=/api`

### S0-1 · lowdb + seed

Track doc: [`01-lowdb.md`](01-lowdb.md)

- [x] `api/db/index.js` — lowdb v7, `initDb()`, `getDb()`, `seedFromFile()`, `ensureSeeded()`, `needsSeed()`
- [x] `api/scripts/seed.js` + `npm run seed`
- [x] Boot: `server.js` calls `initDb()` + `ensureSeeded()` before `listen`
- [x] Passwords: bcrypt `passwordHash` in runtime DB; no `password` field in `db.json`
- [x] `.gitignore` — `api/db/db.json`
- [x] Docker dev — `api-db:/app/db`, `./data:/data:ro`, `SEED_USERS_PATH=/data/users.json`
- [x] Docker prod api — `volumes: !override` with `api-db` + `./data:ro` only (no `./api:/app` overlap)
- [x] API unit tests — `api/test/db.test.js` (8 tests), `make test-api` / `cd api && npm test`

### S0-2 · auth API

Track doc: [`02-auth-api.md`](02-auth-api.md)

- [x] `express.json()` in [`api/app.js`](../../api/app.js)
- [x] `POST /api/auth/login` — bcrypt, `isActive`, JWT `sub: _id` → `{ token }`
- [x] `requireAuth` — Bearer + `JWT_SECRET`, `req.userId` (`api/middleware/requireAuth.js`)
- [x] `GET /api/me` — sanitized body (no `password` / `passwordHash`), includes `balance`
- [x] `PATCH /api/me` — whitelist `name`, `phone`, `address`, `age`, `company`, `eyeColor`; other keys → 400; `{}` → 200 no-op
- [x] `POST /api/auth/logout` — 200 `{ ok: true }` (authenticated)
- [x] Login failures unified **401** `{ error: "Unauthorized" }`
- [x] Tests — [`api/test/auth.test.js`](../../api/test/auth.test.js) — maps [`edgeCases.md`](edgeCases.md) API paths (inactive, unknown email, bad password, JWT errors, PATCH rules, logout)

**Key paths**

| Path | Role |
|------|------|
| `data/users.json` | Seed source (plaintext passwords, git) |
| `api/db/db.json` | Runtime DB (gitignored; volume in Docker) |
| `api/test/fixtures/users.json` | Small fixture for unit tests |

**Verify S0-1 + S0-2**

```bash
cp env.example .env
make dev
make test-api
make smoke-auth    # auth through nginx :82 + data/users.json seed
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

`make smoke-auth` runs [`scripts/smoke-auth.sh`](../../scripts/smoke-auth.sh) (override base: `SMOKE_BASE_URL=http://localhost:82/api`).

---

## Not done yet (in order)

| Track | Doc | Summary |
|-------|-----|---------|
| **S0-3** | [`03-ui.md`](03-ui.md) | login page, dashboard, edit form |
| **S0-4** | [`04-readme.md`](04-readme.md) | reviewer docs, test users, make targets |
| **S0-5** | [`05-bonus.md`](05-bonus.md) | Playwright, responsive (API tests + smoke done) |

---

## API routes today

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/health` | Done |
| POST | `/api/auth/login` | Done |
| POST | `/api/auth/logout` | Done (`requireAuth`) |
| GET | `/api/me` | Done |
| PATCH | `/api/me` | Done |

---

## New chat prompt

Copy the block from [`03-ui.md`](03-ui.md) + **Done** section above.

---

*Last updated: after S0-2 gate — `make test-api`, `make smoke-auth`, docs reconciled.*

