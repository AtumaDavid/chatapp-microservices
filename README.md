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

3. Run a service (examples: auth-service, user-service)

```bash
# Auth service (dev, with auto-reload)
cd services/auth-service
pnpm run dev

# User service (dev, with auto-reload)
cd services/user-service
pnpm run dev
```

Repository layout

- `packages/common` — shared TypeScript utilities (logger, env validation, types)
- `services/*` — independent microservices (e.g., `auth-service`, `gateway-service`, `user-service`)

Where to configure each service

- Each service has a `src/config` or similar folder and reads environment variables. Create a `.env`
  file in the service folder or set env vars before running.

Running as a workspace

- You can run workspace-aware scripts from the repository root (if defined in the root
  `package.json`). Example: `pnpm -w run dev` or run service-local commands as shown above.

Environment variables

- Typical variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `RABBITMQ_URL`, `REDIS_URL`, and
  service-specific vars such as `USER_SERVICE_PORT`, `USER_DB_URL`, `USER_DB_SSL`, and
  `INTERNAL_AUTH_TOKEN`.

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

- PostgreSQL (used by `user-service`):

```bash
# Example: start a PostgreSQL container for the user service
docker run -d --name user-postgres \
  -e POSTGRES_USER=chatapp_user_user \
  -e POSTGRES_PASSWORD=chatapp_user_password \
  -e POSTGRES_DB=chatapp_user_service \
  -p 5433:5432 \
  postgres:15
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
  - `services/user-service/.env` — user-service-specific example (uses PostgreSQL by default)

Note: `.env` and `.env.*` are ignored by git; `.env.example` files are intentionally committed.

---

## Internal service authentication 🔒

This repo protects internal service-to-service requests (e.g., **gateway → auth-service**) using a
shared internal token and a simple header check.

- Header: `x-internal-token`
- Gateway environment variable: `INTERNAL_API_KEY` (used when proxying requests to auth-service)
- Auth service environment variable: `INTERNAL_AUTH_TOKEN` (used by middleware
  `createInternalAuthMiddleware`)

How it works:

- The gateway attaches the `x-internal-token` header to outgoing requests (see
  `services/gateway-service/src/services/auth-proxy.service.ts`).
- The auth service validates that header using the middleware exposed from `packages/common`.

Recommended key format and generation:

- Use a long, high-entropy secret. Example pattern used in this project:
  `auth-gateway-internal_v1_<hex>`
- Generate with OpenSSL or Node's crypto:

```bash
# OpenSSL: 32 bytes -> 64 hex chars
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Security best practices:

- **Do not commit `.env` files** with real secrets into source control. Use `.env.example` for
  examples.
- Rotate keys periodically and store secrets in a secure secret manager (Vault, AWS Secrets Manager,
  GitHub Secrets, etc.) for production deployments.
- Restrict internal traffic where possible (private networks, VPCs, or API gateways).

> Note: after updating `.env`, restart the affected service(s) so the new values are loaded.

---

## Running services locally ▶️

1. Install dependencies and build shared packages:

```bash
pnpm install
cd packages/common
pnpm run build
```

2. Run individual services (from the repo root or service folder):

```bash
# Start auth service (dev, with auto-reload)
cd services/auth-service
pnpm run dev

# Start gateway service (dev, with auto-reload)
cd ../gateway-service
pnpm run dev

# Start user service (dev, with auto-reload)
cd ../user-service
pnpm run dev
```

3. Default ports used by services (change via `.env`):

- Gateway: `GATEWAY_PORT` (default: `4000`)
- Auth service: `AUTH_SERVICE_PORT` (default: `4003`)
- User service: `USER_SERVICE_PORT` (default: `4001`)

You can also bring up supporting services (MySQL, RabbitMQ) via Docker Compose as described above.

---

## Installed Packages (summary)

- **Root (dev tools)**: `@eslint/js`, `@types/node`, `@typescript-eslint/*`, `eslint`, `prettier`,
  `tsx`, `typescript`
- **packages/common**: `express`, `pino`, `pino-pretty`, `zod` (plus dev `@types/express`)
- **services/auth-service**: `@chatapp/common` (workspace), `amqplib`, `cors`, `dotenv`, `express`,
  `helmet`, `sequelize` (plus dev `@types/amqplib`, `@types/cors`, `@types/express`)
- **services/user-service**: `@chatapp/common` (workspace), `express`, `sequelize` (ORM — typically
  used with PostgreSQL here), `dotenv`, `cors`, `helmet`, `amqplib` (plus dev `@types/cors`,
  `@types/express`, `@types/helmet`, `@types/amqplib`)

Note: `services/auth-service` uses MySQL in this repo (see `services/auth-service/.env.example` and
`AUTH_DB_URL`).

---

## Notable packages explained 🧩

- **amqplib** (used by `services/auth-service` and `services/user-service`): a low-level Node.js
  client for AMQP 0-9-1 (RabbitMQ). It exposes connections and channels, and supports publishing and
  consuming messages. In this repo the auth service publishes events to the `auth.event` exchange
  (routing key `auth.user.registered`), and the user service consumes that event to create or sync a
  local user record. Typical usage patterns in microservices:
  - Create a single long-lived connection per process and one or more channels per worker.
  - Assert exchanges/queues at startup, publish messages (persistent/durable) and consume with
    manual acknowledgements (ack/nack) to ensure reliability.
  - Use `prefetch` to control in-flight messages and avoid overloading consumers.
  - For production, consider `amqp-connection-manager` (or similar) to handle reconnection and
    channel recovery automatically.

- **@types/amqplib**: TypeScript type definitions to improve developer experience when working with
  `amqplib` in this TypeScript codebase. Auth events — how services use RabbitMQ

- Exchange: `auth.event`
- Important routing key: `auth.user.registered` — published by `auth-service` when a new user
  registers. `user-service` can consume this event to create or sync a local user record (see
  `packages/common/src/events/auth-event.ts` for payload shape). Quick notes for local development
  with RabbitMQ:

- The repo includes a `docker-compose.yml` entry for RabbitMQ (service `rabbitmq`). You can bring it
  up with `docker compose up -d` or use the simple `docker run` command shown earlier in this
  README.
- When writing producers/consumers: keep channels short-lived for individual tasks, ensure durable
  queues/exchanges when message durability is needed, and always handle errors/edge cases (e.g.,
  reconnection, message retries, poison messages).

If you'd like, I can add a short example producer/consumer snippet to `services/auth-service` that
shows connecting, asserting a queue, publishing, and consuming messages.

Contributing

- Fork, create a branch, add tests/docs, open a PR.

License

- Add a `LICENSE` file to specify the project license.

Contact

- Open an issue for questions or help.
