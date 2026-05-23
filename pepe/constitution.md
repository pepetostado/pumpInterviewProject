# BankZero Constitution (aided with llm)

ok so this is basically the "rules we agreed on" doc for this dev test project. if i'm confused later i read this first 

## what we're building

a tiny fake bank app:

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
| daily workflow | **Docker Compose**                                 | `make dev-up` / don't rely on local npm every day              |
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
| PATCH  | `/api/me`          | yes   | update allowed fields                                                                                                   |
| POST   | `/api/auth/logout` | yes   | jwt in localStorage = client just deletes token. server logout too (if time allows)                                     |

since not in reqs not doing `GET /api/users` list 


## frontend auth (plan)

- `NEXT_PUBLIC_API_URL=/api` → browser hits `http://localhost:82/api/...` through nginx
- after login store JWT in **localStorage** (easy enough)
- little `apiFetch()` helper adds `Authorization: Bearer ...`
- no token → redirect `/login`
- has token → `/me` (home) with profile + edit form

the tradeoff: localStorage + XSS is alright (avoiding cookie/cors stuff yet aware this is a security risk in prod) but httpOnly cookies is better (shipping simple since test assignment)

## docker setup (proof of it working)

### dev (default)

```bash
cp env.example .env
make dev-up    # or >> docker compose up --build
```

- open **http://localhost:82** 
- test api: `curl http://localhost:82/api/health`

**dev api:** Dockerfile target `dev`, `npm start` (`node --watch`), 

volumes:
- `./api:/app`
- `api-node-modules` volume so node_modules isn't wrecked by the bind mount

**dev client:** target `dev`, `next dev`, same volume pattern for client

### prod

```bash
make prod-up
# look up equivalent in Makefile
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
api/db/             → db.json + helpers (TODO)
api/scripts/seed.js → hash seed into db (TODO)
client/             → next app (login + dashboard) (TODO)
nginx/              → routes / → client, /api/ → api
docker-compose.yml  → dev
docker-compose.prod.yml → prod overrides
Makefile            → dev-up, prod-up, etc.
```

## what's done vs what's next

**Detailed checklist:** [`pepe/sprint0/STATUS.md`](sprint0/STATUS.md) (update when a track ships).

### done ✅

- docker dev/prod stack, nginx :82, `/api/health`
- client scaffold (next + tailwind)
- **S0-1 lowdb + seed** — `api/db/`, bcrypt hashes, docker volumes, `make test-api`

### next (in order) 🚧

1. **auth api** — login, jwt middleware, GET/PATCH `/api/me` → [`sprint0/02-auth-api.md`](sprint0/02-auth-api.md)
2. **ui** — login page, dashboard, edit form
3. **readme** — test user credentials, `make` targets, prod-build note
4. **bonus** — auth route tests, playwright, responsive

## non-goals (skipped)

- running `npm init` inside docker on every build (bootstrap files live in git)
- session store / redis
- admin user list endpoints


## references

- train of thought / older notes: `pepe/doc1.ToThought.md`
- ideation: `pepe/doc0.ideation.md`
- assignment text: root `README.md`

last updated: after S0-1 (see sprint0/STATUS.md).

