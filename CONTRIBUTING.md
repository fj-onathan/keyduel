# Contributing to KeyDuel

Thanks for your interest in contributing to KeyDuel.

## Prerequisites

- **Go** 1.25+ — [go.dev/dl](https://go.dev/dl/)
- **Node.js** 22+ — [nodejs.org](https://nodejs.org/)
- **Docker** and **Docker Compose** — [docker.com](https://www.docker.com/)

## Local Setup

```bash
git clone https://github.com/fj-onathan/keyduel.git
cd keyduel
cp .env.example .env        # fill in GitHub OAuth values (or leave defaults for non-auth work)

make dev-up                  # starts Postgres, Redis, API, Race Engine, Bot Runner, Client
make migrate-up              # apply database migrations (first time)
make seed-snippets           # seed code snippets (first time)
```

The app runs at `http://localhost:5173`.

## Development Workflow

1. Fork the repository and create a feature branch
2. Make your changes
3. Run the full CI gate locally:

```bash
make check                   # runs lint + test + build
```

Individual commands:

```bash
make lint                    # Go vet + ESLint
make test                    # Go tests
make build                   # Go compile + Vite build
```

4. Submit a pull request against `main`

## Project Structure

```
keyduel/
├── client/          # React SPA (TypeScript, Vite, Tailwind)
├── server/          # Go backend (3 services)
│   ├── cmd/         # Entry points: api, race-engine, bot-runner
│   ├── internal/    # Core packages: api, auth, bot, cache, config, db, race, session, transport
│   └── migrations/  # PostgreSQL migrations
├── infra/           # Docker and Fly.io deployment configs
├── Makefile         # Developer workflow commands
└── DEPLOY.md        # Production deployment guide
```

## Code Style

- **Go:** Follow standard Go conventions. `go vet` is enforced in CI.
- **TypeScript/React:** ESLint is enforced in CI. Use functional components and hooks.
- **CSS:** Use the existing class-based pattern in `index.css`. Tailwind utilities for layout, custom classes for component styles.

## Database Migrations

If your change requires a database schema change:

1. Create a new migration file in `server/migrations/` with the naming convention `YYYYMMDDHHMMSS_description.up.sql`
2. Test with `make migrate-up` and `make migrate-down`

## Questions?

Open an issue if you have questions or need guidance on a contribution.
