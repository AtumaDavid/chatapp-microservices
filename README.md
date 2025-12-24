# Slack-Discord-style Chat App — Microservice

Compact documentation for the Slack/Discord-style chat microservice.

## Project Overview

This repository is a monorepo containing multiple microservices and shared packages for a Slack/Discord-style chat application. It uses RabbitMQ for message brokering between services, enabling scalable, decoupled communication. The services are intended to be part of a larger system (API gateway, auth service, frontend, etc.).

### Using Shared Code Across Microservices

In a microservice monorepo, shared code (like types, utilities, or validation logic) is placed in a common package (e.g., `packages/common`). This allows all services to reuse the same logic and stay consistent.

#### Why Build the Common Package?

The `common` package is written in TypeScript. Before other services can use its code, it must be compiled to JavaScript. Run:

```bash
cd packages/common
pnpm run build
```

This generates the `dist/` folder with compiled code that other services can import.

#### Why Use `"@chatapp/common": "workspace:^1.0.0"` in package.json?

This line in a service's `package.json` (e.g., `services/auth-service/package.json`) tells pnpm to use the local version of the `common` package from your monorepo, not a remote npm version. This ensures you always use the latest shared code from your workspace.

Example:

```json
"dependencies": {
  "@chatapp/common": "workspace:^1.0.0"
}
```

#### Steps for Adding Common to a Service

1. Build the common package: `pnpm run build` inside `packages/common`.
2. Add the dependency in your service's `package.json` as above.
3. Run `pnpm install` at the root to link everything.
4. Import and use shared code in your service:

```typescript
import { createLogger } from '@chatapp/common';
```

Repeat these steps for any new service that needs to use shared code.

To add a new shared package (like `common`), navigate into the desired folder and run:

```bash
cd packages/common
pnpm init
```

This will create a new `package.json` for the package. You can then add dependencies (e.g., `pnpm add zod pino --filter common`) and start building shared code.

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

## Codebase Overview

This monorepo is organized for scalable microservice development. Here’s how the main parts work together:

### Common Package (`@chatapp/common`)

- **logger.ts**: Exports `createLogger`, a utility that uses `pino` and `pino-pretty` for structured and pretty logging. In development, logs are colorized and human-readable; in production, logs are structured for performance and integration.
- **env.ts**: Exports `createEnv`, a utility to validate environment variables using zod schemas. Throws an error if validation fails, ensuring services only start with correct configuration.
- **index.ts**: Re-exports zod, logger, and env utilities for easy import in services.

### Auth Service Example

- **src/config/env.ts**: Loads environment variables (with dotenv), defines and validates them using zod and `createEnv`. Example schema includes `NODE_ENV` and `AUTH_SERVICE_PORT`.
- **src/utils/logger.ts**: Creates a logger instance for the auth service using `createLogger` from common.
- **src/app.ts**: Sets up an Express app with a `/health` endpoint for health checks.
- **src/index.ts**: Main entry point. Creates the app, starts the HTTP server on the validated port, and logs startup or errors.

### Key Practices

- All services share code from `@chatapp/common` for logging and environment validation.
- `pino-pretty` is used for readable logs in development.
- Environment variables are strictly validated at startup for safety.
- The structure is modular and ready for scaling with more microservices.

---

### Root (Monorepo)

**Dev Dependencies:**

- @eslint/js
- @types/node
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- eslint
- prettier
- tsx
- typescript

### packages/common

**Dependencies:**

- pino
- pino-pretty
- zod

**Dev Dependencies:**

(none)

### services/auth-service

**Dependencies:**

- @chatapp/common
- dotenv
- express

**Dev Dependencies:**
(none)

---

## Common Package Utilities

### Logger (`pino` & `pino-pretty`)

The `common` package provides a logger utility using [pino](https://getpino.io/), a fast and low-overhead Node.js logging library. For development, it uses [pino-pretty](https://github.com/pinojs/pino-pretty) to format logs in a readable, colorized way.

**How it works:**

- The `createLogger` function (see `src/logger.ts`) creates a logger instance. In development, it uses `pino-pretty` for readable, colorized logs (make sure `pino-pretty` is installed as a dependency). In production, it outputs structured logs for performance and integration with log management tools.
- You can set options like the logger name and log level.

**Example usage:**

```typescript
import { createLogger } from '@chatapp/common';
const logger = createLogger({ name: 'chat-service' });
logger.info('Service started');
```

### Environment Validation (`zod`)

The `common` package uses [zod](https://github.com/colinhacks/zod) for environment variable validation.

**How it works:**

- The `createEnv` function (see `src/env.ts`) takes a Zod schema and validates environment variables against it. If validation fails, it throws an error with details.
- This ensures your service only starts with all required environment variables present and correctly typed.

**Example usage:**

```typescript
import { z } from 'zod';
import { createEnv } from '@chatapp/common';

const envSchema = z.object({
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'production']),
});

const env = createEnv(envSchema, { serviceName: 'chat-service' });
```

---

---

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
