# S0-1 · lowdb + seed

Refs: [`edgeCases.md`](edgeCases.md) (seed idempotent, prod no db). Status: [`STATUS.md`](STATUS.md).

## Goal

Runtime DB at `api/db/db.json` with bcrypt hashes. Never read plaintext passwords from `data/users.json` at request time.

## Checklist

- [x] Add `api/db/` + `api/db/index.js` (lowdb v7 read/write `users`)
- [x] Add `api/scripts/seed.js` — read `data/users.json`, hash passwords, drop plaintext `password`, write `db.json`
- [x] `api/package.json` script: `"seed": "node scripts/seed.js"`
- [x] `.gitignore` — ignore `api/db/db.json` (commit folder + helpers only)
- [x] Docker named volume `api-db` → `/app/db` in `docker-compose.yml` (+ prod compose if needed)
- [x] API boot: missing/empty db → run seed once (idempotent rerun per edgeCases)
- [x] Verify: after seed, `db.json` has hashes, no plaintext passwords
- [x] Prod: `docker compose -f docker-compose.yml -f docker-compose.prod.yml build` — api still has users after up

## Done when

`make dev` (or compose up) and api can read users from lowdb without touching seed file at runtime.
