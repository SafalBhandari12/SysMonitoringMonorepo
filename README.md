# Monitoring Platform Architecture

This repository is a Turborepo monorepo for a domain and API monitoring platform.
It includes:

- A Next.js frontend for authentication and dashboard UX
- An Express backend for API, auth, orchestration, and queue producers
- A dedicated BullMQ worker app for API monitoring execution
- A shared Prisma database package and shared types package

## Monorepo Layout

Top-level workspace groups:

- apps
  - backend: Express API and service orchestration
  - frontend: Next.js App Router application
  - workers: background worker process for monitoring jobs
- packages
  - db: Prisma schema, generated client, enums, and DB exports
  - types: shared cross-app types
  - eslint-config, typescript-config, ui: shared tooling and UI library

Build and task orchestration is managed by Turbo through root scripts.

## Runtime Components

### 1) Frontend (Next.js)

The frontend is located in apps/frontend and uses the App Router.

Primary responsibilities:

- Landing and login user flows
- Dashboard and operational views
- Calling backend API endpoints
- Rendering monitoring insights using componentized UI

Global app layout wires theme support and shared styling.

### 2) Backend API (Express)

The backend runs an Express server with:

- JSON parsing middleware
- Redis-backed session management (express-session + connect-redis)
- Versioned route namespace under /api/v1
- Central not-found and error handlers

Current route groups include:

- /auth
- /domain
- /api
- /api-group
- /incident

The backend follows a layered structure:

- controller: request/response handlers
- services: business logic and orchestration
- routes: route definitions and composition
- middleware: auth and domain guards
- queue: BullMQ queue producers/factories
- workers: backend-owned queue consumers for selected jobs

### 3) Worker App (BullMQ Consumer)

The workers app (apps/workers) runs a BullMQ Worker that consumes a region-specific monitoring queue and executes API checks.

Core behavior:

- Reads jobs containing apiId
- Calls service logic to fetch/store monitoring outcomes
- Logs completion and failure for operational visibility

This process is separated from the API server to isolate background execution from request latency.

### 4) Shared Database Package (Prisma)

The db package defines the PostgreSQL data model and exports generated Prisma artifacts and enums for all apps.

Key entities:

- User
- Domain
- ApiGroup
- Api
- ApiMetrics
- ApiResponse
- DailyStats
- Incident

Key enums:

- DomainVerificationStatus
- methodEnum
- apiStatusEnum
- incidentStatusEnum
- plans
- regions

## Data and Control Flow

### Domain onboarding and verification

1. User registers a domain via backend API.
2. Backend persists the Domain with verification metadata.
3. Backend enqueues a domain verification job with retries/backoff.
4. Domain verification worker resolves DNS and validates TXT token.
5. Domain verification status is updated in Postgres.

### API monitoring setup

1. User adds an API endpoint under a domain.
2. Backend validates domain ownership, plan limits, and uniqueness.
3. Backend creates API metrics rows per region.
4. Backend schedules recurring monitoring jobs per region queue.
5. Worker app consumes jobs and stores response outcomes.

### Percentile calculations

1. On domain registration, backend schedules repeating percentile jobs.
2. Percentile worker consumes jobs and computes aggregates.
3. Aggregated metrics are written to ApiMetrics for dashboard use.

## Queue Architecture (BullMQ + Redis)

Current queue topology:

- domain-verification
- percentile-calculation
- api-monitoring-<region>

Design notes:

- Backend produces jobs and controls scheduling semantics.
- Workers consume and execute compute/network-heavy tasks.
- Queue names are centralized in constants and helper utilities.

## Persistence Architecture (PostgreSQL)

Storage concerns are centralized in Prisma models:

- Domain ownership and verification lifecycle
- Endpoint definitions and request details (method, headers/body/params)
- Time-series response records by region
- Aggregated availability and latency metrics
- Incident lifecycle tracking

This split supports both real-time checks and historical trend analysis.

## Security and Session Model

- Authentication uses Google OIDC flow in backend auth service/controller.
- Session state is persisted in Redis.
- Backend stores authenticated user identity in session for protected routes.

## Current Architectural Characteristics

- Clear separation between synchronous API handling and asynchronous monitoring work
- Region-partitioned queue strategy for monitoring scalability
- Shared schema/types packages to avoid contract drift across services
- Monorepo task orchestration via Turbo for consistent build/dev flows

## Running the Repository

From the repository root:

```sh
npm install
npm run dev
```

Common root scripts:

- npm run dev
- npm run build
- npm run lint
- npm run check-types

## Notes

- Node engine is configured as >= 18 at the root.
- Backend and workers depend on Redis and PostgreSQL availability.
- The architecture is optimized for continuous API health checks with background processing.
