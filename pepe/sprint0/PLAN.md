# Sprint 0 — eng plan

<i>AI assisted (gemini 3 flash)</i>

Source of truth: [`constitution.md`](../constitution.md). **Progress:** [`STATUS.md`](STATUS.md). Diagrams: [`architecture/diagrams0.md`](../architecture/diagrams0.md). Edge decisions: [`edgeCases.md`](edgeCases.md).

## Step 0

**Reuse:** express + deps, nginx `:82`, docker dev/prod, `data/users.json`, client scaffold.

**Cut:** `GET /api/users`, httpOnly cookies, session store, CI. (Logout stub shipped in S0-2.)

**Order:** `01` → `02` → `03` → `04` → `05` (bonus only when core is green on prod build).

**Recommendation:** HOLD scope — no parallel UI before auth API.

## Architecture (one-liner)

Browser → nginx → api (lowdb) + client. Seed copies hashed users from `data/users.json` into runtime `api/db/db.json`. JWT `sub` = `_id`. Client stores token in localStorage.

## PATCH whitelist

`name`, `phone`, `address`, `age`, `company`, `eyeColor` — not `email`, `balance`, `isActive`, `password`, `_id`, `guid`.

### PATCH value rules

- **Empty body `{}`** → **200** no-op (unchanged).
- **Any key in the body** must be non-blank after trim (whitespace-only counts as blank) → else **400**.
- **`name`:** both `first` and `last` required non-empty strings.
- **`age`:** finite integer `>= 1` (no empty, no `NaN`).
- **Strings** (`phone`, `address`, `company`, `eyeColor`): non-empty after trim.
- Server trims string fields on successful write; `name` parts trimmed separately.

UI (S0-3) validates the **full edit form** on Save so no whitelisted field is left blank, even if only one field changed.

## NOT in scope

Session/redis, admin user list, password reset, email change, cookie auth (unless reopened).

## Reuse map

| Need         | Where                                           |
| ------------ | ----------------------------------------------- |
| Health route | `api/app.js`                                    |
| Deps         | `api/package.json`                              |
| Seed source  | `data/users.json` (4 active)                    |
| Proxy        | `nginx/default.conf`                            |
| Env          | `env.example`                                   |
| Compose      | `docker-compose.yml`, `docker-compose.prod.yml` |

## Test strategy

- **Must:** login + `/api/me` unit tests (`auth.test.js`); nginx smoke (`make smoke-auth`)
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
