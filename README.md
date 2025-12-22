# Slack-Discord-style Chat App — Microservice

Compact documentation for the Slack/Discord-style chat microservice.

## Project Overview

This repository is a monorepo containing multiple microservices and shared packages for a Slack/Discord-style chat application. It uses RabbitMQ for message brokering between services, enabling scalable, decoupled communication. The services are intended to be part of a larger system (API gateway, auth service, frontend, etc.).

### Monorepo Structure

The repository is organized as a pnpm workspace with TypeScript project references for efficient builds and shared types. Key packages and services:

- `packages/common` — Shared code, types, and utilities used by all services. This package includes:
  - Schema validation with [`zod`](https://github.com/colinhacks/zod)
  - Logging utilities with [`pino`](https://getpino.io/)
  - Common types and helpers for consistent data handling across microservices
- `services/user-service` — User management (registration, profiles, etc.)
- `services/chat-service` — Core chat logic (channels, messages, history)
- `services/gateway-service` — API gateway or WebSocket gateway for client connections
- `services/auth-service` — Authentication and authorization logic

Each service/package is a TypeScript project and can be developed/tested independently.

## Key Features

- Realtime messaging (WebSocket / socket-based)
- Channel / room support
- Message persistence and retrieval
- Scalable microservice-ready design

## Architecture

- Transport: WebSockets or similar realtime protocol
- Messaging: RabbitMQ for inter-service communication and event delivery
- Persistence: database (e.g., PostgreSQL, MongoDB) for messages
- Cache: optional Redis for presence/fast lookups
- Auth: external auth service (JWT / OAuth)

## Tech Stack

- Node.js / TypeScript
- Package manager: `pnpm`
- Runtime: Docker (optional)

## TypeScript Project References

The root `tsconfig.json` uses project references to enable incremental builds and type-checking across all services and shared packages. See the `references` array in `tsconfig.json` for the current list.

## Dev tooling (installed)

This project uses modern TypeScript tooling and opinionated formatting/linting. The following devDependencies are commonly present (your install may vary):

- `typescript`
- `tsx` (fast TypeScript runner)
- `@types/node`
- `prettier`
- `eslint`, `@eslint/js`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`

Add or update tools using `pnpm` as needed.

## Recommended top-level scripts

This repository uses workspace-aware top-level scripts that forward commands to package workspaces. Add the following to your top-level `package.json` if you want the same behavior:

```json
{
  "scripts": {
    "build": "pnpm -r --workspace-root=false run build",
    "dev": "pnpm -r --workspace-root=false run dev",
    "lint": "pnpm -r --workspace-root=false run lint",
    "lint:fix": "pnpm -r --workspace-root=false run lint:fix",
    "format": "pnpm -r --workspace-root=false run format",
    "test": "pnpm -r --workspace-root=false run test"
  }
}
```

Run the top-level scripts locally with `pnpm run <script>` (they will forward to workspace packages):

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run format
pnpm run test
```

## Getting Started

Prerequisites:

- Node.js (LTS) installed
- `pnpm` installed globally

Install dependencies:

```bash
pnpm install
```

## Configuration

Create a `.env` file or configure environment variables for runtime. Typical variables:

- `PORT` — service port
- `DATABASE_URL` — connection string for the database
- `REDIS_URL` — Redis connection (optional)
- `JWT_SECRET` — signing secret for JWT tokens
- `RABBITMQ_URL` — RabbitMQ connection string (e.g., amqp://user:pass@localhost:5672)

### RabbitMQ Setup

This microservice requires a running RabbitMQ instance. You can run RabbitMQ locally using Docker:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The default management UI will be available at http://localhost:15672 (user/pass: guest/guest).

Set the `RABBITMQ_URL` environment variable in your `.env` file to match your RabbitMQ instance:

```
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Development

- Follow the Getting Started steps.
- Run the dev server (`pnpm run dev`), then connect a frontend or WebSocket client.

## Testing

Run unit and integration tests (if present):

```bash
pnpm test
```

## Contributing

Contributions are welcome. Open an issue to discuss large changes. For code contributions:

1. Fork the repo
2. Create a feature branch
3. Add tests and documentation
4. Open a pull request

## License

Add a license file to the repository (e.g., `LICENSE`) and update this section with the chosen license.

## Contact

For questions or help, open an issue or contact the maintainers of this repository.
