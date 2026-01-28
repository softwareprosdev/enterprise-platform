# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Platform is a multi-tenant SaaS application for software development agencies. It provides client management, project tracking, task management, and billing features.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev servers (API at :3001, Web at :3000, Mailpit at :8025)
docker-compose up -d && pnpm dev

# Database operations
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations

# Code quality
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
pnpm format           # Prettier

# Testing
pnpm test             # All tests
pnpm test:api         # API tests only (--filter=@enterprise/api)
pnpm test:web         # Web tests only (--filter=@enterprise/web)
```

## Architecture

### Monorepo Structure

- `apps/api` - Fastify + tRPC backend
- `apps/web` - React 19 + Vite + TanStack Router frontend
- `packages/db` - Drizzle ORM schema and migrations (PostgreSQL 16)
- `packages/shared` - Shared Zod schemas and types
- `infra/docker` - Production Dockerfiles
- `infra/terraform` - AWS infrastructure (VPC, RDS, ElastiCache, ECS, ALB)

### Multi-Tenancy

All tenant-scoped tables include a `tenant_id` column. The tRPC context automatically injects the current tenant from the session. Tenant identification is via subdomain or header.

### API Layer (apps/api)

tRPC routers in `apps/api/src/trpc/procedures/`:
- `auth` - Login, register, password reset, MFA, sessions
- `tenants`, `users`, `clients`, `projects`, `tasks` - CRUD operations
- `onboarding` - Multi-step tenant setup flow
- `billing`, `dashboard` - Subscription and analytics

Procedure types defined in `apps/api/src/trpc/router.ts`:
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires `admin` or `owner` role
- `ownerProcedure` - Requires `owner` role only

### Database Schema (packages/db)

Core entities: `tenants`, `users`, `sessions`, `clients`, `projects`, `tasks`, `milestones`, `deliverables`

Billing entities: `plans`, `subscriptions`, `invoices`

All tables use UUIDs. Status fields use PostgreSQL enums (e.g., `taskStatusEnum`, `projectStatusEnum`).

### Frontend (apps/web)

- Routes in `apps/web/src/routes/` use TanStack Router file-based routing
- UI components in `apps/web/src/components/ui/` (shadcn/ui)
- tRPC client configured with `httpBatchLink` at `/trpc`
- Styling: TailwindCSS with dark mode support (class-based)

### Authentication

- Passwords hashed with Argon2 (@node-rs/argon2)
- Sessions stored in PostgreSQL, cached in Redis
- TOTP MFA support with backup codes (oslo library)
- OAuth2 ready (GitHub, Google)

## Key Conventions

- Package manager: pnpm 9+ (required, uses frozen lockfile in CI)
- Node.js 20+ required
- All timestamps use `withTimezone: true`
- API uses superjson for Date/BigInt serialization over tRPC
- Pre-commit hooks: Husky + lint-staged (auto-runs ESLint + Prettier)
