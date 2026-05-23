# Smart Pump Constitution (aided with llm)

ok so this is basically the "rules we agreed on" doc for this dev test project. if i'm confused later i read this first 

## what we're building

a tiny SMART Pump account app (per assignment):

- login with **email + password**
- only **valid** users get in
- once you're in you see your profile + balance
- you can edit your personal details
- backend has to use **node + lowdb**
- UI should match the wireframes (`assets/wireframes.png`), wanna go with mobile-first vibe 

seed data lives in `/data/users.json` but that's **not** the runtime database. gotta copy/hash into lowdb (cuz pw)

## stack (what we picked and why)

| thing          | choice                                             | why                                                            |
| -------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| API            | Express 5, ESM (`"type": "module"`)                | assignment wants node, `import` feels normal now               |
| DB             | lowdb v7                                           | required                                                       |
| passwords      | bcryptjs                                           | seed file is plaintext, db stores **hashes** only              |
| auth           | JWT via `jsonwebtoken`                             | no session store to manage in docker; `JWT_SECRET` in `.env`   |
| frontend       | Next.js (App Router) + React                       | wireframes + react, already scaffolded                         |
| reverse proxy  | nginx                                              | one URL for reviewer: port **82** on host → nginx → api/client |
| daily workflow | **Docker Compose**                                 | `make dev` / don't rely on local npm every day                 |
| prod vs dev    | multistage Dockerfiles + `docker-compose.prod.yml` | dev = hot reload + bind mounts; prod = baked images, no mounts |

**cors:** installed but mostly unnecessary unless launching on different origins (api/client)

## definitions 

### valid user

a user counts as valid for login iff:

1. email exists in lowdb
2. password matches the **hash** in db (`bcrypt.compare`)
3. `isActive === true`

wrong password or unknown email or inactive → **401** (don't leak which one)

### user id

use **`_id`** from the seed data in JWT `sub` and db lookups i will ignore `guid` unless we have a reason later

### login payload

README says email, so body is:

```json
{ "email": "...", "password": "..." }
```

### authorized user

same logged-in user. they can only read/update **themselves** (`/api/me`), not a random `/api/users/:id` (no admin dashboard nor privileges in this version)

## API routes (plan)

nginx forwards `/api/*` to the api container **with the path intact**, so express routes should include the `/api` prefix.

| method | path               | auth? | what                                                                                                                    |
| ------ | ------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`      | no    | `{ ok: true }` — sanity check just used when started to develop so i could have a running server and curl it (**done**) |
| POST   | `/api/auth/login`  | no    | returns `{ token }`                                                                                                     |
| GET    | `/api/me`          | yes   | current user profile + balance                                                                                          |
| PATCH  | `/api/me`          | yes   | whitelist fields only; blank/invalid values → **400**; `{}` → **200** no-op (see [`sprint0/PLAN.md`](sprint0/PLAN.md))  |
| POST   | `/api/auth/logout` | yes   | **done (API)** — 200 `{ ok: true }`; **client** delete token → **S0-3**                                                 |

since not in reqs not doing `GET /api/users` list 


## frontend auth (**done — S0-3**)

- `NEXT_PUBLIC_API_URL=/api` → browser hits `http://localhost:82/api/...` through nginx
- JWT in **localStorage** key `smartpump_token` (`client/lib/auth.js`)
- `apiFetch()` (`client/lib/apiFetch.js`) adds `Authorization: Bearer ...`; on **401** clears token + hard-nav to `/login` (login uses raw `fetch`, not `apiFetch`)
- no token on `/` → redirect `/login`; token on `/login` → redirect `/`
- home loads `GET /api/me`; inline edit form PATCHes whitelist fields (client + server validate non-blank values)
- **logout / stale token:** `clearToken()` + `/login`; optional `POST /api/auth/logout` (no server revoke)
- branding: `assets/logo.png` → `client/public/logo.png`; UI title **Smart Pump**

the tradeoff: localStorage + XSS is alright (avoiding cookie/cors stuff yet aware this is a security risk in prod) but httpOnly cookies is better (shipping simple since test assignment)

## docker setup (proof of it working)

### dev (default)

```bash
cp env.example .env
make dev       # or: docker compose up --build
```

- open **http://localhost:82** 
- test api: `curl http://localhost:82/api/health`

**dev api:** Dockerfile target `dev`, `npm start` (`node --watch`), 

volumes:
- `./api:/app`
- `api-node-modules` volume so node_modules isn't wrecked by the bind mount

**dev client:**

Dockerfiles use node:20-slim and install deps in the image (npm ci in base/dev); client dev copies that tree with COPY --from=base and only runs npm run dev (no runtime install)

### prod

```bash
make prod
```

- same url **http://localhost:82**
- api target `prod` → `node server.js`
- client target `prod` → `next build` then `node server.js` from standalone output (minimal prod package)
- **`volumes: !reset []`** in prod compose — super important. without this, prod client tried to run `server.js` from the host folder (doesn't exist) and exploded.

**before deploy** run prod **build** just to catch stuff (no precommit nor ci/cd pipeline checks)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### env split

- `.env`: ...(secrets) + `NEXT_PUBLIC_API_URL` 
- `NODE_ENV` / `PORT` in compose files

## repo map (mental)

```text
data/users.json     → seed source (plaintext passwords, do not use raw at runtime)
api/                → express, lowdb, jwt, bcrypt
api/db/             → db.json + helpers (S0-1)
api/scripts/seed.js → hash seed into db (S0-1)
client/             → next app (login + dashboard — **done S0-3**)
client/lib/         → auth.js, apiFetch.js
client/public/logo.png → SMART Pump logo (served at /logo.png)
nginx/              → routes / → client, /api/ → api
docker-compose.yml  → dev
docker-compose.prod.yml → prod overrides
Makefile            → dev, prod, test-api, test-client, test, test-e2e, test-all, smoke-auth
```

## what's done vs what's next

**Detailed checklist:** [`pepe/sprint0/STATUS.md`](sprint0/STATUS.md) (update when a track ships).

### done ✅

- docker dev/prod stack, nginx :82, `/api/health`, compose network `smartpump-network`
- client scaffold (next + tailwind)
- **S0-1 lowdb + seed** — `api/db/`, bcrypt hashes, docker volumes, `make test-api`
- **S0-2 auth API** — login, logout, GET/PATCH `/api/me` (whitelist + value validation), `api/test/auth.test.js`, `make smoke-auth`
- **S0-3 UI** — login, dashboard, edit, logout, `smartpump_token`, Smart Pump branding → [`sprint0/03-ui.md`](sprint0/03-ui.md)

### next (in order) 🚧

1. **readme** — test user credentials, `make` targets, prod-build note → [`sprint0/04-readme.md`](sprint0/04-readme.md)
2. **bonus** — Playwright, responsive → [`sprint0/05-bonus.md`](sprint0/05-bonus.md)
3. **pre-next-phase polish** (optional, in `03-ui.md`) — hamburger drawer... i liked it better without it (more minimal)

## non-goals (skipped)

- running `npm init` inside docker on every build (bootstrap files live in git)
- session store / redis
- admin user list endpoints


## references

- train of thought / older notes: `pepe/doc1.ToThought.md`
- ideation: `pepe/doc0.ideation.md`
- assignment text: root `README.md`

last updated: after S0-3 + Smart Pump rebrand (see sprint0/STATUS.md).

