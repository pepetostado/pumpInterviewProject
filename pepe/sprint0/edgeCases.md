* Login
    1. boyd :: 401 — `auth.test.js` (fixture inactive); `make smoke-auth` (Boyd seed)
    2. unknown email :: 401 — both

* GET /me
    1. expired/bad :: 401 → /login — `auth.test.js`; smoke GET /me no token

* PATCH /me
    1. balance, _id, pw :: 400 — `auth.test.js`; smoke PATCH balance
    2. empty :: 200 — `auth.test.js`; smoke PATCH `{}`

* SEED 
    1. rerun :: idempotent — `db.test.js`

* PROD (DOCKER)
    1. no db.json :: seed — `ensureSeeded()` on boot; prod compose build
   
* UI
    1. stale token :: 401 /me (clears storage) — **S0-3** [`03-ui.md`](03-ui.md) `apiFetch` + logout button; not API
    2. logout :: clear localStorage + `/login` — **S0-3** (server stub in S0-2 is optional symmetry only)
