# S0-5 · bonus

Only after S0-1–4 green, including prod compose build.

## Checklist

- [x] API unit tests — login (200 active, 401 inactive/bad pw/unknown), GET/PATCH `/api/me` (auth + PATCH whitelist) — **done in S0-2** ([`api/test/auth.test.js`](../../api/test/auth.test.js)); nginx smoke: `make smoke-auth`
- [ ] Playwright — login → balance visible → edit field → value persists
- [ ] Responsive spot-check 375px / 768px (mostly covered if mobile-first in S0-3)

## Done when

Bonus items from root README are demonstrable; core flow still works.
