import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

// Auth procedures
import { authRouter } from './procedures/auth.js';
import { tenantsRouter } from './procedures/tenants.js';
import { usersRouter } from './procedures/users.js';
import { clientsRouter } from './procedures/clients.js';
import { projectsRouter } from './procedures/projects.js';
import { tasksRouter } from './procedures/tasks.js';
import { onboardingRouter } from './procedures/onboarding.js';
import { billingRouter } from './procedures/billing.js';
import { dashboardRouter } from './procedures/dashboard.js';

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof Error ? error.cause.message : null,
    },
  }),
});

// Export reusable parts
export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.tenant) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      tenant: ctx.tenant,
    },
  });
});

// Admin middleware
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.tenant) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  if (ctx.user.role !== 'owner' && ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      tenant: ctx.tenant,
    },
  });
});

// Owner middleware
const isOwner = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.tenant) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  if (ctx.user.role !== 'owner') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only the workspace owner can access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      tenant: ctx.tenant,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const ownerProcedure = t.procedure.use(isOwner);

// Root router
export const appRouter = router({
  auth: authRouter,
  tenants: tenantsRouter,
  users: usersRouter,
  clients: clientsRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  onboarding: onboardingRouter,
  billing: billingRouter,
  dashboard: dashboardRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
