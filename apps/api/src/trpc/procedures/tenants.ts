import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, ownerProcedure } from '../trpc.js';
import { tenantUpdateSchema } from '@enterprise/shared';
import { tenants } from '@enterprise/db/schema';
import { eq } from '@enterprise/db';

export const tenantsRouter = router({
  // Get current tenant
  current: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.query.tenants.findFirst({
      where: eq(tenants.id, ctx.tenant.id),
    });

    if (!tenant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      });
    }

    return tenant;
  }),

  // Update tenant settings
  update: ownerProcedure.input(tenantUpdateSchema).mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.db
      .update(tenants)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id))
      .returning();

    return updated;
  }),

  // Get tenant usage stats
  usage: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.query.tenants.findFirst({
      where: eq(tenants.id, ctx.tenant.id),
      with: {
        users: true,
        clients: true,
        projects: true,
      },
    });

    if (!tenant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      });
    }

    // Get plan limits
    const plan = await ctx.db.query.plans.findFirst({
      where: eq(tenants.plan, tenant.plan ?? 'free'),
    });

    const limits = (plan?.limits as { projects: number; teamMembers: number; clients: number }) || {
      projects: 1,
      teamMembers: 2,
      clients: 5,
    };

    return {
      usage: {
        projects: tenant.projects.length,
        teamMembers: tenant.users.length,
        clients: tenant.clients.length,
      },
      limits,
      plan: tenant.plan,
    };
  }),
});
