# Slack-Discord-style Chat App — Microservice

Compact documentation for the Slack/Discord-style chat microservice.

## Project Overview

This repository is a monorepo containing multiple microservices and shared packages for a
Slack/Discord-style chat application. It uses RabbitMQ for message brokering between services,
enabling scalable, decoupled communication. The services are intended to be part of a larger system
(API gateway, auth service, frontend, etc.).

### Using Shared Code Across Microservices

In a microservice monorepo, shared code (like types, utilities, or validation logic) is placed in a
common package (e.g., `packages/common`). This allows all services to reuse the same logic and stay
consistent.

#### Why Build the Common Package?

The `common` package is written in TypeScript. Before other services can use its code, it must be
compiled to JavaScript. Run:

```bash
cd packages/common
pnpm run build
```

This generates the `dist/` folder with compiled code that other services can import.

# Slack-Discord-style Chat App — Microservices

Lightweight monorepo for building Slack/Discord-style chat microservices.

This repository contains shared packages and independent services designed for realtime messaging,
with an emphasis on small, focused services and a shared `packages/common` library for utilities
(logging, env validation, types).

Prerequisites

- Node.js (LTS)
- pnpm

Quickstart

1. Install dependencies

```bash
pnpm install
```

2. Build shared packages (if needed)

```bash
cd packages/common
pnpm run build
```

3. Run a service (example: auth-service)

```bash
cd services/auth-service
pnpm run dev
```

Repository layout

- `packages/common` — shared TypeScript utilities (logger, env validation, types)
- `services/*` — independent microservices (e.g., `auth-service`, `chat-service`, `gateway-service`)

Where to configure each service

- Each service has a `src/config` or similar folder and reads environment variables. Create a `.env`
  file in the service folder or set env vars before running.

Running as a workspace

- You can run workspace-aware scripts from the repository root (if defined in the root
  `package.json`). Example: `pnpm -w run dev` or run service-local commands as shown above.

Environment variables

- Typical variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `RABBITMQ_URL`, `REDIS_URL`.

Docker (development)

- RabbitMQ for local development:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

- MySQL (used by `auth-service`):

```bash
# Example: start a MySQL container for the auth service
docker run -d --name auth-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=auth_db \
  -p 3306:3306 \
  mysql:8
```

- Adminer (web UI for databases):

```bash
docker run -d --name adminer -p 8080:8080 adminer
```

- Start everything with `docker compose` (if you prefer):

```bash
docker compose up -d
```

- Stop and remove example containers:

```bash
docker stop rabbitmq auth-mysql adminer
docker rm rabbitmq auth-mysql adminer
```

Notes

- The `packages/common` package exposes helpers used across services; build it before running
  services that import it.
- See `services/auth-service/src` for a minimal example Express app and graceful shutdown logic.

## Environment examples

- Example env files are included for convenience. Copy the appropriate file and fill secrets before
  running a service:
  - `/.env.example` — workspace-level example values
  - `services/auth-service/.env.example` — auth-service-specific example (uses MySQL by default)

Note: `.env` and `.env.*` are ignored by git; `.env.example` files are intentionally committed.

## Installed Packages (summary)

- **Root (dev tools)**: `@eslint/js`, `@types/node`, `@typescript-eslint/*`, `eslint`, `prettier`,
  `tsx`, `typescript`
- **packages/common**: `express`, `pino`, `pino-pretty`, `zod` (plus dev `@types/express`)
- **services/auth-service**: `@chatapp/common` (workspace), `cors`, `dotenv`, `express`, `helmet`,
  `sequelize` (plus dev `@types/cors`, `@types/express`)

Note: `services/auth-service` uses MySQL in this repo (see `services/auth-service/.env.example` and
`AUTH_DB_URL`).

Contributing

- Fork, create a branch, add tests/docs, open a PR.

License

- Add a `LICENSE` file to specify the project license.

Contact

- Open an issue for questions or help.
