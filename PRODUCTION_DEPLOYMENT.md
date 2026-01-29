# Villa Homes Platform - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Completed Features (Ready for Production)

#### Backend API (tRPC)
- ✅ **Authentication & Authorization**: Login, register, MFA, session management
- ✅ **User Management**: CRUD operations, role management, invitations
- ✅ **Tenant Management**: Multi-tenant support, settings, usage tracking
- ✅ **Homeowners/Clients**: Full CRUD with portal access management
- ✅ **Projects**: Complete project lifecycle management with phases
- ✅ **Tasks**: Task management with assignments, scheduling, inspection tracking
- ✅ **Subcontractors**: Contractor management with ratings, trades, insurance tracking
- ✅ **Trades**: Trade categories and management
- ✅ **Communications**: Call/SMS/Email tracking with AI analysis support
- ✅ **Dashboard**: Comprehensive analytics and metrics
- ✅ **Billing**: Subscription management, invoices (Stripe integration placeholders)
- ✅ **Onboarding**: Multi-step onboarding flow

#### Database Schema
- ✅ All tables created and relationships defined
- ✅ Multi-tenant architecture with proper isolation
- ✅ Construction-specific entities (phases, trades, daily logs, etc.)
- ✅ Enums for all status fields
- ✅ Proper indexing for performance

#### Infrastructure
- ✅ Docker configuration for production
- ✅ PostgreSQL 16 with health checks
- ✅ Redis for session storage
- ✅ Environment configuration templates
- ✅ CI/CD workflows (GitHub Actions)

---

## 🔧 Deployment Steps for Coolify VPS

### 1. Environment Setup

Create `.env` file on your Coolify VPS with the following variables:

```bash
# Database
DATABASE_URL="postgresql://enterprise:CHANGE_ME@postgres:5432/enterprise"
POSTGRES_PASSWORD="CHANGE_ME_STRONG_PASSWORD"

# Redis
REDIS_URL="redis://redis:6379"

# Application
NODE_ENV="production"
API_PORT=3001
WEB_PORT=3000
API_URL="https://api.yourdomain.com"
WEB_URL="https://yourdomain.com"

# Authentication (Generate with: openssl rand -base64 32)
AUTH_SECRET="CHANGE_ME_GENERATE_RANDOM_SECRET"

# Stripe (Optional - for billing)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PUBLISHABLE_KEY=""

# Email (Configure your SMTP)
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT=587
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-smtp-password"
SMTP_SECURE=true
SMTP_FROM="Villa Homes <noreply@yourdomain.com>"

# Feature Flags
ENABLE_OAUTH=false
ENABLE_MFA=true
ENABLE_BILLING=false
```

### 2. Database Migration

Before first deployment, run database migrations:

```bash
# SSH into your Coolify VPS
cd /path/to/enterprise-platform

# Run migrations
pnpm --filter @enterprise/db migrate:deploy
```

### 3. Deploy with Docker Compose

```bash
# Pull latest code
git pull origin main

# Build and start services
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Check API health
curl https://api.yourdomain.com/health

# Check all services are running
docker compose -f docker-compose.prod.yml ps
```

### 5. Create First Admin User

Access the registration page and create your first account. The first user will automatically be assigned the `owner` role.

---

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong `AUTH_SECRET` (32+ characters)
- [ ] Configure HTTPS/SSL certificates (Coolify handles this)
- [ ] Set up firewall rules (only expose ports 80, 443)
- [ ] Enable database backups
- [ ] Configure Redis persistence
- [ ] Review and update CORS settings if needed
- [ ] Set up monitoring and alerting

---

## 📊 Post-Deployment Verification

### API Endpoints to Test

1. **Health Check**: `GET /health`
2. **Auth**: `POST /trpc/auth.login`
3. **Dashboard**: `GET /trpc/dashboard.stats`
4. **Projects**: `GET /trpc/projects.list`

### Database Verification

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify first tenant
SELECT * FROM tenants LIMIT 1;

-- Check user count
SELECT COUNT(*) FROM users;
```

---

## 🚨 Troubleshooting

### API Won't Start
- Check DATABASE_URL is correct
- Verify PostgreSQL is running: `docker compose ps postgres`
- Check logs: `docker compose logs api`

### Database Connection Issues
- Ensure PostgreSQL health check passes
- Verify network connectivity between containers
- Check DATABASE_URL format

### Redis Connection Issues
- Verify Redis is running: `docker compose ps redis`
- Check REDIS_URL configuration
- Test connection: `docker exec enterprise-redis redis-cli ping`

---

## 📈 Monitoring & Maintenance

### Daily Checks
- Monitor API response times
- Check error logs
- Verify database backup completion

### Weekly Maintenance
- Review disk space usage
- Check for security updates
- Monitor active user sessions

### Monthly Tasks
- Database optimization (VACUUM, ANALYZE)
- Review and archive old data
- Update dependencies

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker compose -f docker-compose.prod.yml down

# Restore database backup
pg_restore -U enterprise -d enterprise /path/to/backup.sql

# Deploy previous version
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📞 Support

For issues during deployment:
1. Check logs: `docker compose logs -f`
2. Verify environment variables
3. Ensure all services are healthy
4. Review this guide's troubleshooting section

---

## ✨ Next Steps After Deployment

1. **Configure Stripe** (if using billing features)
2. **Set up email templates** for user invitations
3. **Import initial data** (trades, default phases)
4. **Configure backup schedule**
5. **Set up monitoring** (Sentry, LogRocket, etc.)
6. **Train team** on platform usage

---

## 🎯 Production-Ready Features

All core features are implemented and tested:
- ✅ Multi-tenant architecture
- ✅ Role-based access control (Owner, Project Manager, Office Staff, Field Staff, Client)
- ✅ Complete project lifecycle management
- ✅ Task scheduling and tracking
- ✅ Subcontractor management
- ✅ Communication logging
- ✅ Dashboard analytics
- ✅ Onboarding flow

**The platform is ready for live testing and production deployment!**
