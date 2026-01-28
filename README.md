# Enterprise Platform

A multi-tenant SaaS platform for software development agencies. Built with modern technologies for scalability, type-safety, and developer experience.

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **API**: tRPC v11 (end-to-end type safety)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Auth**: Lucia Auth v3 + OAuth2 + TOTP MFA

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: TanStack Form
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Charts**: Recharts

### Infrastructure
- **Monorepo**: Turborepo + pnpm
- **Testing**: Vitest, Supertest, Playwright
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/softwareprosdev/enterprise-platform.git
   cd enterprise-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

   - API: http://localhost:3001
   - Web: http://localhost:3000
   - Mailpit: http://localhost:8025

## Project Structure

```
enterprise-platform/
├── apps/
│   ├── api/          # Fastify + tRPC backend
│   └── web/          # React + Vite frontend
├── packages/
│   ├── db/           # Drizzle schema & migrations
│   └── shared/       # Shared types & utilities
├── infra/
│   ├── docker/       # Production Dockerfiles
│   └── terraform/    # Infrastructure as Code
└── .github/
    └── workflows/    # CI/CD pipelines
```

## Development Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm start            # Start production servers

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix lint errors
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript type checking

# Database
pnpm db:generate      # Generate Drizzle client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database

# Testing
pnpm test             # Run unit tests
pnpm test:api         # Run API tests
pnpm test:web         # Run frontend tests
pnpm test:e2e         # Run E2E tests
```

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

## Architecture

### Multi-Tenant Design
- Tenant identification via subdomain or header
- Row-level isolation with tenant_id on all tables
- Middleware enforces tenant context on every request

### Authentication
- Email/password with bcrypt hashing
- OAuth2 providers (GitHub, Google)
- TOTP-based MFA with backup codes
- Session management via Redis

### RBAC Roles
- **owner**: Full tenant access
- **admin**: Manage team and settings
- **member**: Standard access
- **client**: Limited client portal access

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - SoftwarePros
