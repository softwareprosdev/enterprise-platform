import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure, ownerProcedure } from '../trpc.js';
import { plans, subscriptions, invoices, tenants } from '@enterprise/db/schema';
import { eq, desc } from '@enterprise/db';

export const billingRouter = router({
  // Get available plans
  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const planList = await ctx.db.query.plans.findMany({
      where: eq(plans.isActive, true),
      orderBy: [plans.sortOrder],
    });

    return planList.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features as string[],
      limits: plan.limits as { projects: number; teamMembers: number; clients: number },
    }));
  }),

  // Get current subscription
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, ctx.tenant.id),
      with: {
        plan: true,
      },
    });

    const tenant = await ctx.db.query.tenants.findFirst({
      where: eq(tenants.id, ctx.tenant.id),
      columns: { plan: true, trialEndsAt: true },
    });

    return {
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            plan: subscription.plan
              ? {
                  id: subscription.plan.id,
                  name: subscription.plan.name,
                  slug: subscription.plan.slug,
                }
              : null,
          }
        : null,
      currentPlan: tenant?.plan || 'free',
      trialEndsAt: tenant?.trialEndsAt,
      isTrialing: tenant?.trialEndsAt ? new Date(tenant.trialEndsAt) > new Date() : false,
    };
  }),

  // Get invoices
  getInvoices: protectedProcedure
    .input(
      z
        .object({
          page: z.number().int().positive().default(1),
          pageSize: z.number().int().positive().max(50).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20 } = input || {};
      const offset = (page - 1) * pageSize;

      const invoiceList = await ctx.db.query.invoices.findMany({
        where: eq(invoices.tenantId, ctx.tenant.id),
        orderBy: [desc(invoices.createdAt)],
        limit: pageSize,
        offset,
      });

      const total = await ctx.db
        .select({ count: invoices.id })
        .from(invoices)
        .where(eq(invoices.tenantId, ctx.tenant.id));

      return {
        items: invoiceList.map((invoice) => ({
          id: invoice.id,
          amount: invoice.total,
          status: invoice.status,
          paidAt: invoice.paidAt,
          dueDate: invoice.dueDate,
          createdAt: invoice.createdAt,
        })),
        total: total.length,
        page,
        pageSize,
        totalPages: Math.ceil(total.length / pageSize),
      };
    }),

  // Create checkout session (Stripe)
  createCheckout: ownerProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.db.query.plans.findFirst({
        where: eq(plans.id, input.planId),
      });

      if (!plan || !plan.stripePriceId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found or not available for purchase',
        });
      }

      // TODO: Implement Stripe checkout session creation
      // For now, return a placeholder

      return {
        checkoutUrl: `https://checkout.stripe.com/placeholder?plan=${plan.slug}`,
      };
    }),

  // Create customer portal session (Stripe)
  createPortalSession: ownerProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, ctx.tenant.id),
    });

    if (!subscription?.stripeCustomerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No billing account found. Please subscribe to a plan first.',
      });
    }

    // TODO: Implement Stripe customer portal session creation

    return {
      portalUrl: 'https://billing.stripe.com/placeholder',
    };
  }),

  // Cancel subscription
  cancelSubscription: ownerProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, ctx.tenant.id),
    });

    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active subscription found',
      });
    }

    // TODO: Implement Stripe subscription cancellation

    await ctx.db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return { success: true };
  }),

  // Resume subscription (if set to cancel)
  resumeSubscription: ownerProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, ctx.tenant.id),
    });

    if (!subscription || !subscription.cancelAtPeriodEnd) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No subscription pending cancellation',
      });
    }

    // TODO: Implement Stripe subscription resume

    await ctx.db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return { success: true };
  }),
});
