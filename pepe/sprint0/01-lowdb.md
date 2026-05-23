# S0-1 · lowdb + seed

Refs: [`edgeCases.md`](edgeCases.md) (seed idempotent, prod no db).

## Goal

Runtime DB at `api/db/db.json` with bcrypt hashes. Never read plaintext passwords from `data/users.json` at request time.

## Checklist

- [ ] Add `api/db/` + `api/db/index.js` (lowdb v7 read/write `users`)
- [ ] Add `api/scripts/seed.js` — read `data/users.json`, hash passwords, drop plaintext `password`, write `db.json`
- [ ] `api/package.json` script: `"seed": "node scripts/seed.js"`
- [ ] `.gitignore` — ignore `api/db/db.json` (commit folder + helpers only)
- [ ] Docker named volume `api-db` → `/app/db` in `docker-compose.yml` (+ prod compose if needed)
- [ ] API boot: missing/empty db → run seed once (idempotent rerun per edgeCases)
- [ ] Verify: after seed, `db.json` has hashes, no plaintext passwords
- [ ] Prod: `docker compose -f docker-compose.yml -f docker-compose.prod.yml build` — api still has users after up

## Done when

`make dev-up` (or compose up) and api can read users from lowdb without touching seed file at runtime.
