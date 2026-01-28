import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

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
  // Narrow the types after the null check
  const user = ctx.user;
  const tenant = ctx.tenant;
  return next({
    ctx: {
      ...ctx,
      user,
      tenant,
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
  const user = ctx.user;
  const tenant = ctx.tenant;
  return next({
    ctx: {
      ...ctx,
      user,
      tenant,
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
  const user = ctx.user;
  const tenant = ctx.tenant;
  return next({
    ctx: {
      ...ctx,
      user,
      tenant,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const ownerProcedure = t.procedure.use(isOwner);
