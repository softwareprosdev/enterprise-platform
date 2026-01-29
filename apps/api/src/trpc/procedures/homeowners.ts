import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { homeownerCreateSchema, homeownerUpdateSchema, paginationSchema } from '@enterprise/shared';
import { homeowners } from '@enterprise/db/schema';
import { eq, and, desc, ilike, or, sql } from '@enterprise/db';

export const homeownersRouter = router({
  // List homeowners
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          status: z.enum(['inquiry', 'contracted', 'construction', 'punch_list', 'completed', 'warranty', 'archived']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20, search, status } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(homeowners.tenantId, ctx.tenant.id);

      if (status) {
        const combined = and(whereClause, eq(homeowners.status, status));
        if (combined) whereClause = combined;
      }

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(homeowners.firstName, `%${search}%`),
            ilike(homeowners.lastName, `%${search}%`),
            ilike(homeowners.email, `%${search}%`),
            ilike(homeowners.phone, `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      const homeownerList = await ctx.db.query.homeowners.findMany({
        where: whereClause,
        orderBy: [desc(homeowners.createdAt)],
        limit: pageSize,
        offset,
        with: {
          projects: {
            columns: { id: true },
          },
        },
      });

      // Count total for pagination
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(homeowners)
        .where(whereClause);

      const total = countResult?.count || 0;

      // Add project count to each homeowner
      const homeownersWithCount = homeownerList.map((h) => ({
        ...h,
        projectCount: h.projects?.length || 0,
      }));

      return {
        homeowners: homeownersWithCount,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single homeowner
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const homeowner = await ctx.db.query.homeowners.findFirst({
      where: and(eq(homeowners.id, input.id), eq(homeowners.tenantId, ctx.tenant.id)),
      with: {
        projects: true,
        contacts: true,
        communications: {
          orderBy: [desc(homeowners.createdAt)],
          limit: 10,
        },
        invoices: {
          orderBy: [desc(homeowners.createdAt)],
          limit: 10,
        },
      },
    });

    if (!homeowner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Homeowner not found',
      });
    }

    return homeowner;
  }),

  // Create homeowner
  create: protectedProcedure.input(homeownerCreateSchema).mutation(async ({ ctx, input }) => {
    const [homeowner] = await ctx.db
      .insert(homeowners)
      .values({
        tenantId: ctx.tenant.id,
        status: 'inquiry',
        ...input,
      })
      .returning();

    return homeowner;
  }),

  // Update homeowner
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: homeownerUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.homeowners.findFirst({
        where: and(eq(homeowners.id, id), eq(homeowners.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Homeowner not found',
        });
      }

      const [updated] = await ctx.db
        .update(homeowners)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(homeowners.id, id))
        .returning();

      return updated;
    }),

  // Update homeowner status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['inquiry', 'contracted', 'construction', 'punch_list', 'completed', 'warranty', 'archived']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;

      const existing = await ctx.db.query.homeowners.findFirst({
        where: and(eq(homeowners.id, id), eq(homeowners.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Homeowner not found',
        });
      }

      // Set contract date when transitioning to contracted
      const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
      if (status === 'contracted' && !existing.contractSignedAt) {
        updateData.contractSignedAt = new Date();
      }

      const [updated] = await ctx.db
        .update(homeowners)
        .set(updateData)
        .where(eq(homeowners.id, id))
        .returning();

      return updated;
    }),

  // Delete homeowner
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.homeowners.findFirst({
        where: and(eq(homeowners.id, input.id), eq(homeowners.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Homeowner not found',
        });
      }

      await ctx.db.delete(homeowners).where(eq(homeowners.id, input.id));

      return { success: true };
    }),

  // Get homeowner stats
  stats: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const homeowner = await ctx.db.query.homeowners.findFirst({
      where: and(eq(homeowners.id, input.id), eq(homeowners.tenantId, ctx.tenant.id)),
      with: {
        projects: {
          with: {
            budgetLineItems: true,
            invoices: true,
          },
        },
      },
    });

    if (!homeowner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Homeowner not found',
      });
    }

    // Calculate total contract value
    const totalContractValue = homeowner.projects.reduce(
      (sum, p) => sum + parseFloat(p.contractAmount || '0'),
      0
    );

    // Calculate total invoiced and paid
    let totalInvoiced = 0;
    let totalPaid = 0;
    for (const project of homeowner.projects) {
      for (const invoice of project.invoices || []) {
        totalInvoiced += parseFloat(invoice.total || '0');
        if (invoice.status === 'paid') {
          totalPaid += parseFloat(invoice.paidAmount || '0');
        }
      }
    }

    return {
      totalProjects: homeowner.projects.length,
      totalContractValue,
      totalInvoiced,
      totalPaid,
      balanceDue: totalInvoiced - totalPaid,
    };
  }),
});
