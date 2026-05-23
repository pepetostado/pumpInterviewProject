# Sprint 0 — eng plan

<i>AI assisted (gemini 3 flash)</i>

Source of truth: [`constitution.md`](../constitution.md). Diagrams: [`architecture/diagrams0.md`](../architecture/diagrams0.md). Edge decisions: [`edgeCases.md`](edgeCases.md).

## Step 0

**Reuse:** express + deps, nginx `:82`, docker dev/prod, `data/users.json`, client scaffold.

**Cut:** server logout, `GET /api/users`, httpOnly cookies, session store, CI.

**Order:** `01` → `02` → `03` → `04` → `05` (bonus only when core is green on prod build).

**Recommendation:** HOLD scope — no parallel UI before auth API.

## Architecture (one-liner)

Browser → nginx → api (lowdb) + client. Seed copies hashed users from `data/users.json` into runtime `api/db/db.json`. JWT `sub` = `_id`. Client stores token in localStorage.

## PATCH whitelist

`name`, `phone`, `address`, `age`, `company`, `eyeColor` — not `email`, `balance`, `isActive`, `password`, `_id`, `guid`.

## NOT in scope

Session/redis, admin user list, password reset, email change, cookie auth (unless reopened).

## Reuse map

| Need         | Where                                           |
| ------------ | ----------------------------------------------- |
| Health route | `api/server.js`                                 |
| Deps         | `api/package.json`                              |
| Seed source  | `data/users.json` (4 active)                    |
| Proxy        | `nginx/default.conf`                            |
| Env          | `env.example`                                   |
| Compose      | `docker-compose.yml`, `docker-compose.prod.yml` |

## Test strategy

- **Must:** login + `/api/me` unit tests; curl smoke on `:82`
- **Bonus:** Playwright happy path
- **Skip:** load/chaos

## Performance

lowdb + 5 users = fine. bcrypt only on login.

## Files in this folder

| File                             | Track             |
| -------------------------------- | ----------------- |
| [01-lowdb.md](01-lowdb.md)       | DB + seed         |
| [02-auth-api.md](02-auth-api.md) | login + me        |
| [03-ui.md](03-ui.md)             | login + dashboard |
| [04-readme.md](04-readme.md)     | reviewer docs     |
| [05-bonus.md](05-bonus.md)       | tests             |
