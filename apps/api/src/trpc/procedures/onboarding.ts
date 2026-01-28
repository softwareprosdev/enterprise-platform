import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../router.js';
import {
  onboardingCompanySchema,
  onboardingTeamSchema,
  onboardingBrandingSchema,
  onboardingIntegrationsSchema,
  onboardingBillingSchema,
} from '@enterprise/shared';
import { tenants, invitations } from '@enterprise/db/schema';
import { eq } from '@enterprise/db';
import { onboardingStore } from '../../lib/redis.js';
import { generateId } from '@enterprise/shared';

const ONBOARDING_STEPS = ['company', 'team', 'branding', 'integrations', 'billing', 'complete'] as const;

export const onboardingRouter = router({
  // Get onboarding state
  getState: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.query.tenants.findFirst({
      where: eq(tenants.id, ctx.tenant.id),
    });

    if (!tenant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      });
    }

    // Get cached onboarding data
    const cachedData = await onboardingStore.get(ctx.tenant.id);

    return {
      currentStep: tenant.onboardingStep || 'company',
      steps: ONBOARDING_STEPS,
      data: {
        ...(tenant.onboardingData as Record<string, unknown>),
        ...cachedData,
      },
      isComplete: tenant.onboardingStep === 'complete',
    };
  }),

  // Step 1: Company details
  updateCompany: protectedProcedure.input(onboardingCompanySchema).mutation(async ({ ctx, input }) => {
    // Save to tenant
    await ctx.db
      .update(tenants)
      .set({
        name: input.name,
        onboardingData: {
          ...(await getOnboardingData(ctx.db, ctx.tenant.id)),
          company: input,
        },
        onboardingStep: 'team',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id));

    // Cache in Redis
    await onboardingStore.update(ctx.tenant.id, { company: input });

    return { nextStep: 'team' };
  }),

  // Step 2: Team setup
  updateTeam: protectedProcedure.input(onboardingTeamSchema).mutation(async ({ ctx, input }) => {
    // Create invitations if any
    if (input.invites && input.invites.length > 0) {
      const inviteValues = input.invites.map((invite) => ({
        tenantId: ctx.tenant.id,
        email: invite.email.toLowerCase(),
        role: invite.role as 'admin' | 'member',
        token: generateId(32),
        invitedById: ctx.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));

      await ctx.db.insert(invitations).values(inviteValues);

      // TODO: Send invitation emails
    }

    // Update tenant
    await ctx.db
      .update(tenants)
      .set({
        onboardingData: {
          ...(await getOnboardingData(ctx.db, ctx.tenant.id)),
          team: { inviteCount: input.invites?.length || 0 },
        },
        onboardingStep: 'branding',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id));

    await onboardingStore.update(ctx.tenant.id, {
      team: { inviteCount: input.invites?.length || 0 },
    });

    return { nextStep: 'branding' };
  }),

  // Step 3: Branding
  updateBranding: protectedProcedure.input(onboardingBrandingSchema).mutation(async ({ ctx, input }) => {
    const currentSettings = (await ctx.db.query.tenants.findFirst({
      where: eq(tenants.id, ctx.tenant.id),
      columns: { settings: true },
    }))?.settings as Record<string, unknown> || {};

    await ctx.db
      .update(tenants)
      .set({
        logo: input.logo || null,
        settings: {
          ...currentSettings,
          brandColor: input.brandColor,
        },
        onboardingData: {
          ...(await getOnboardingData(ctx.db, ctx.tenant.id)),
          branding: input,
        },
        onboardingStep: 'integrations',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id));

    await onboardingStore.update(ctx.tenant.id, { branding: input });

    return { nextStep: 'integrations' };
  }),

  // Step 4: Integrations
  updateIntegrations: protectedProcedure
    .input(onboardingIntegrationsSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tenants)
        .set({
          onboardingData: {
            ...(await getOnboardingData(ctx.db, ctx.tenant.id)),
            integrations: input.integrations || [],
          },
          onboardingStep: 'billing',
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      await onboardingStore.update(ctx.tenant.id, { integrations: input.integrations || [] });

      return { nextStep: 'billing' };
    }),

  // Step 5: Billing plan selection
  updateBilling: protectedProcedure.input(onboardingBillingSchema).mutation(async ({ ctx, input }) => {
    // Get plan details
    const plan = await ctx.db.query.plans.findFirst({
      where: eq(tenants.id, input.planId),
    });

    // For now, just mark the selected plan
    // Stripe integration would happen here

    await ctx.db
      .update(tenants)
      .set({
        plan: plan?.slug || 'free',
        onboardingData: {
          ...(await getOnboardingData(ctx.db, ctx.tenant.id)),
          billing: { planId: input.planId },
        },
        onboardingStep: 'complete',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id));

    // Clear onboarding cache
    await onboardingStore.delete(ctx.tenant.id);

    return { nextStep: 'complete' };
  }),

  // Skip to step
  skipToStep: protectedProcedure
    .input(onboardingBillingSchema.pick({ planId: true }).partial())
    .mutation(async ({ ctx }) => {
      // Mark onboarding as complete
      await ctx.db
        .update(tenants)
        .set({
          onboardingStep: 'complete',
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      await onboardingStore.delete(ctx.tenant.id);

      return { success: true };
    }),
});

// Helper to get current onboarding data
async function getOnboardingData(
  db: typeof import('@enterprise/db').db,
  tenantId: string
): Promise<Record<string, unknown>> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
    columns: { onboardingData: true },
  });
  return (tenant?.onboardingData as Record<string, unknown>) || {};
}
