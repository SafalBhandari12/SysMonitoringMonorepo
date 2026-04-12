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

### End-to-end lifecycle overview

The platform lifecycle has three major phases:

1. Domain registration and ownership verification
2. API registration and recurring regional monitoring
3. Aggregation and incident lifecycle management

All three phases share the same pattern:

1. Backend receives and validates request
2. Backend persists baseline records in Postgres
3. Backend enqueues one-off or repeating BullMQ jobs in Redis
4. Workers execute network or compute-heavy tasks
5. Workers write raw and aggregated outputs back to Postgres

### Phase 1: Domain registration and DNS verification

#### Request and persistence

1. User calls domain registration endpoint.
2. Backend checks for duplicate domain ownership.
3. Backend creates a Domain row with:

- verificationStatus defaulting to PENDING
- generated verificationCode token
- verificationAttempts and timestamps for auditability

#### Queue scheduling

4. Backend enqueues a domain-verification job with:

- deterministic jobId (`verify-domain-<domain>`)
- retries (attempts) and exponential backoff
- cleanup policy for completed/failed jobs

#### Worker execution

5. Domain verification worker consumes the job.
6. Worker updates verification attempt metadata.
7. Worker resolves NS records, resolves the nameserver IP, and queries TXT records from that nameserver.
8. Worker compares TXT values against expected token format:

- `monitoring-verify=<verificationCode>`

#### Final state update

9. Domain status is set to VERIFIED or FAILED.
10. On success, verifiedAt is set.
11. Verification metadata remains queryable for UX/status endpoints.

### Phase 2: API registration and monitoring schedule creation

#### Request validation

1. User adds an API under a verified/owned domain.
2. Backend validates:

- domain ownership
- optional API group existence
- plan-specific API count limit
- path + method uniqueness per domain

#### Initial record creation

3. Backend creates Api record containing method/path and optional request payload metadata (headers, body, queryParams, pathParams).
4. For each configured region, backend creates an ApiMetrics row keyed by apiId + region.

#### Recurring job creation

5. Backend creates repeating jobs in region-scoped queues:

- queue name pattern: `api-monitoring-<region>`
- job payload includes apiId
- current repeat interval is every 10 seconds
- immediate first run is enabled

This means one API registration fans out into multiple regional schedules.

### Phase 3: Monitoring execution (fetching APIs and storing responses)

This is the most important runtime path for operational data.

#### Job consumption and target resolution

1. Worker process consumes `api-monitoring-<region>` job.
2. Worker loads API details from Postgres (method, path, optional payload metadata, linked domain).
3. Worker builds target URL using domain + path:

- development: `http://<domain><path>`
- non-development: `https://<domain><path>`

#### HTTP probe execution

4. Worker executes fetch with timeout control (AbortController).
5. Probe outcome is normalized to one of:

- UP for successful HTTP responses
- DOWN for non-2xx/3xx or network-level failures
- TIMEOUT when request exceeds timeout threshold

6. Worker captures responseTime and statusCode for storage.

#### Transactional persistence and counters

7. Worker executes a DB transaction and writes:

- ApiResponse row (raw event): apiId, region, status, statusCode, responseTime, createdAt
- DailyStats upsert (date + region key): increments totalCount and upCount when status is UP
- ApiMetrics update (apiId + region key): increments rolling totalCount and upCount

This keeps both raw events and dashboard-friendly counters in sync per check.

### Incident detection and recovery logic

Incident handling is embedded in the same monitoring transaction path.

#### Failure window tracking

1. For DOWN/TIMEOUT outcomes, worker writes timestamped failure markers in Redis sorted set (`api_failures:<apiId>`).
2. Worker trims old markers outside the configured lookback window.
3. Worker counts failures in-window and compares with failure threshold.

#### Incident creation/update

4. If threshold is crossed:

- create ONGOING incident if none exists
- append current region if incident exists but region is not yet listed

#### Recovery

5. For UP outcomes, worker checks recent failure count against recovery threshold.
6. If under recovery threshold and latest incident is ONGOING, worker marks it RESOLVED.

This provides region-aware, threshold-based incident state transitions without requiring a separate incident daemon.

### Percentile aggregation lifecycle

Percentile computation is handled by backend-owned worker process.

1. During domain registration, backend schedules repeating percentile-calculation job for that domain (hourly).
2. Percentile worker consumes job and loads all APIs for the domain.
3. For each API, worker scans ApiResponse records for the last 90 days.
4. Worker calculates per-region:

- p99 response time
- p90 response time
- average response time

5. Worker upserts ApiMetrics per region with computed percentile values.

This keeps percentile latency views updated independently of per-request counters.

### Resulting data products

At steady state, each API check contributes to:

1. Raw monitoring history in ApiResponse
2. Daily reliability counters in DailyStats
3. Long-lived counters and latency aggregates in ApiMetrics
4. Incident timeline in Incident

This split enables both high-fidelity debugging (raw events) and fast dashboard queries (aggregates).

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
