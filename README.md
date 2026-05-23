# Smart Pump (dev exercise)

Login, view balance, edit profile. Node.js API + Next.js UI + lowdb. Seed data: [`data/users.json`](data/users.json). Wireframes: [`assets/wireframes.png`](assets/wireframes.png).

---

## New machine setup

**Install**

| Tool                                          | Why                                                       |
| --------------------------------------------- | --------------------------------------------------------- |
| [Docker](https://docs.docker.com/get-docker/) | Runs API, client, nginx on port **82**                    |
| [Node.js 20+](https://nodejs.org/)            | `make test` / `make test-all` on the host                 |
| `make`                                        | Targets below (macOS/Linux; Windows: use WSL or Git Bash) |

**Run the app**

```bash
git clone https://github.com/pepetostado/pumpInterviewProject.git && cd dev-test
cp env.example .env          # JWT_SECRET + NEXT_PUBLIC_API_URL=/api
make dev                     # first run builds images; wait for logs to settle
```

Open **http://localhost:82**

**Try it:** active user `henderson.briggs@geeknet.net` / `23derd*334` (from seed). Inactive user Boyd returns 401.

Stop stack: `make dev-down` (or Ctrl+C in the dev terminal).

---

## Tests

Full map: [`pepe/sprint0/TESTS.md`](pepe/sprint0/TESTS.md)

| Command         | Docker `:82` running? | What                                 |
| --------------- | --------------------- | ------------------------------------ |
| `make test`     | No                    | 22 unit tests (API + client)         |
| `make test-all` | **Yes**               | Unit + 2 Playwright e2e + auth smoke |

```bash
# terminal 1
make dev

# terminal 2
make test-all
```

First `make test-e2e` downloads Chromium into `client/.playwright-browsers/` (gitignored; macOS arm64/x64 supported). Expect **19** API + **5** client + **2** e2e + smoke **ok**.

Unit only (no browser): `make test`

---

## Makefile cheatsheet

`make help` lists targets. Common ones:

- `make dev` / `make dev-down` — dev stack at http://localhost:82
- `make test-api` / `make test-client` / `make test-e2e` / `make smoke-auth` — run one layer
- `make logs` — follow compose logs

**Prod-style run** (no bind mounts):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

Same URL: http://localhost:82

---

## Original brief (recruiter)

**Requirements:** email/password login, active users only, show profile + balance, edit details, lowdb + Node.

**Bonus (this repo):** responsive UI, API unit tests, UI functional tests (Playwright).

**Time box:** ~3 evenings suggested.
