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
- [x] `Makefile` — `dev`, `dev-down`, `prod`, `prod-down`, `logs`
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

**Key paths**

| Path | Role |
|------|------|
| `data/users.json` | Seed source (plaintext passwords, git) |
| `api/db/db.json` | Runtime DB (gitignored; volume in Docker) |
| `api/test/fixtures/users.json` | Small fixture for unit tests |

**Verify S0-1**

```bash
cp env.example .env
make dev          # or: docker compose up --build
make test-api
curl http://localhost:82/api/health
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

---

## Not done yet (in order)

| Track | Doc | Summary |
|-------|-----|---------|
| **S0-2** | [`02-auth-api.md`](02-auth-api.md) | login, JWT middleware, GET/PATCH `/api/me` |
| **S0-3** | [`03-ui.md`](03-ui.md) | login page, dashboard, edit form |
| **S0-4** | [`04-readme.md`](04-readme.md) | reviewer docs, test users, make targets |
| **S0-5** | [`05-bonus.md`](05-bonus.md) | auth integration tests, Playwright, responsive |

---

## API routes today

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/health` | Done |
| POST | `/api/auth/login` | Not started |
| GET | `/api/me` | Not started |
| PATCH | `/api/me` | Not started |
| POST | `/api/auth/logout` | Optional, not started |

---

## New chat prompt

Copy the block from [`02-auth-api.md`](02-auth-api.md) checklist + **Done** section above, or ask the agent to read this file and `02-auth-api.md`.

---

*Last updated: after S0-1 + `make test-api` (db/seed tests).*
