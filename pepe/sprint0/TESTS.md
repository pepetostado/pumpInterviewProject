# Tests map (MVP)

**Quick run**

| Command | Docker `:82`? |
|---------|---------------|
| `make test` | No (22 unit tests) |
| `make test-all` | **Yes** for e2e + smoke |

```bash
make dev          # terminal 1
make test-all     # terminal 2
```

| Make target | Kind | Where | Count | What |
|-------------|------|--------|-------|------|
| `make test-api` | Unit | `api/test/*.test.js` | 19 | Login, GET/PATCH `/api/me`, logout, seed |
| `make test-client` | Unit | `client/test/*.test.js` | 5 | `auth.js` token helpers; `apiFetch` Bearer, PATCH JSON, 401 |
| `make test` | Unit | ↑ | 22 | API + client only |
| `make test-e2e` | Functional | `client/e2e/happy-path.spec.js` | 2 | Guest guard; login → balance → edit → logout (waits for hydrated login form before submit) |
| `make smoke-auth` | Smoke | `scripts/smoke-auth.sh` | 5 checks | Health, login, me, PATCH rules, Boyd 401 |
| `make test-all` | All | — | — | `test` → `test-e2e` → `smoke-auth` |

**README bonuses:** API unit (`test-api`) + UI functional (`test-e2e`). Responsive = mobile-first UI only (no viewport automation).

---

## Future (ideation only)

| Idea | Why |
|------|-----|
| E2E bad login + Boyd inactive | Login error UI |
| E2E stale `smartpump_token` | `apiFetch` redirect |
| Playwright `@375px` / `@768px` | Responsive bonus automation |
| `validateEditForm` unit test | Edit rules without browser |
| CI `make test-all` on push | Regression gate |
