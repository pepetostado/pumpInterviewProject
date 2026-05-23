# S0-5 · bonus

Refs: test map [`TESTS.md`](TESTS.md).

## Checklist

- [x] API unit tests — `make test-api` ([`api/test/auth.test.js`](../../api/test/auth.test.js), [`db.test.js`](../../api/test/db.test.js))
- [x] nginx smoke — `make smoke-auth` ([`scripts/smoke-auth.sh`](../../scripts/smoke-auth.sh))
- [x] UI functional — `make test-e2e` ([`client/e2e/happy-path.spec.js`](../../client/e2e/happy-path.spec.js))
- [x] Client unit — `make test-client` ([`auth.test.js`](../../client/test/auth.test.js), [`apiFetch.test.js`](../../client/test/apiFetch.test.js))
- [ ] Responsive automation — mobile-first UI shipped; no Playwright viewport suite yet

## Done when

README bonus items demonstrable: `make test` + `make dev` + `make test-e2e`.
