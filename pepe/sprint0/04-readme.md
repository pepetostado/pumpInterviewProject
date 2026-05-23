# S0-4 · README / reviewer docs

## Goal

Someone clones repo, copies env, runs make/compose, logs in with documented test user.

## Checklist

- [ ] `cp env.example .env` + `JWT_SECRET` note
- [ ] Dev: `make dev-up` (or align naming with Makefile — document actual target)
- [ ] URL: `http://localhost:82`
- [ ] Test users: 1–2 **active** emails + plaintext passwords from seed (e.g. Henderson)
- [ ] Note: Boyd (`boyd.small@endipine.biz`) is inactive → login must fail
- [ ] Prod: `make prod-up` + prod build command from constitution
- [ ] curl examples: `/api/health`, login, `/api/me` with Bearer
- [ ] Link to `pepe/constitution.md` or keep root README assignment section in sync

## Done when

README alone is enough for SMART Pump reviewer to run and test without asking you.
