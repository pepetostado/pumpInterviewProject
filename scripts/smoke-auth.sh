#!/usr/bin/env bash
# Auth smoke through nginx (default :82). Requires: make dev, seeded users.
set -euo pipefail

BASE="${SMOKE_BASE_URL:-http://localhost:82/api}"

curl -sf "${BASE}/health" | grep -q '"ok":true'

TOKEN=$(curl -sf -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"henderson.briggs@geeknet.net","password":"23derd*334"}' \
  | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0,'utf8')).token)")

curl -sf "${BASE}/me" -H "Authorization: Bearer ${TOKEN}" | grep -q '"balance"'

code=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "${BASE}/me" \
  -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' \
  -d '{"balance":"$0"}')
test "$code" = "400"

code=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "${BASE}/me" \
  -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' \
  -d '{}')
test "$code" = "200"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"boyd.small@endipine.biz","password":"any"}')
test "$code" = "401"

echo "smoke-auth ok"
