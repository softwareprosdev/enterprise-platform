import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { subcontractorCreateSchema, subcontractorUpdateSchema, paginationSchema } from '@enterprise/shared';
import { subcontractors, trades, subcontractorTrades } from '@enterprise/db/schema';
import { eq, and, desc, ilike, or, sql } from '@enterprise/db';

export const subcontractorsRouter = router({
  // List subcontractors
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          status: z.enum(['active', 'preferred', 'on_hold', 'do_not_use']).optional(),
          trade: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20, search, status, trade } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(subcontractors.tenantId, ctx.tenant.id);

      if (status) {
        const combined = and(whereClause, eq(subcontractors.status, status));
        if (combined) whereClause = combined;
      }

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(subcontractors.companyName, `%${search}%`),
            ilike(subcontractors.contactName, `%${search}%`),
            ilike(subcontractors.contactEmail, `%${search}%`),
            ilike(subcontractors.licenseNumber, `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      // If filtering by trade, we need to join with subcontractorTrades
      let subcontractorList: Awaited<ReturnType<typeof ctx.db.query.subcontractors.findMany>>;
      if (trade) {
        const tradeId = trade;
        const tradeSubs = await ctx.db.query.subcontractorTrades.findMany({
          where: eq(subcontractorTrades.tradeId, tradeId),
          columns: { subcontractorId: true },
        });
        const tradeSubIds = tradeSubs.map((st) => st.subcontractorId);

        if (tradeSubIds.length > 0) {
          subcontractorList = await ctx.db.query.subcontractors.findMany({
            where: and(whereClause, sql`${subcontractors.id} IN (${tradeSubIds.join(',')})`),
            orderBy: [desc(subcontractors.rating), desc(subcontractors.createdAt)],
            limit: pageSize,
            offset,
            with: {
              primaryTrade: true,
              trades: {
                with: {
                  trade: true,
                },
              },
            },
          });
        } else {
          subcontractorList = [];
        }
      } else {
        subcontractorList = await ctx.db.query.subcontractors.findMany({
          where: whereClause,
          orderBy: [desc(subcontractors.rating), desc(subcontractors.createdAt)],
          limit: pageSize,
          offset,
          with: {
            primaryTrade: true,
            trades: {
              with: {
                trade: true,
              },
            },
          },
        });
      }

      // Count total for pagination
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(subcontractors)
        .where(whereClause);

      const total = countResult?.count || 0;

      return {
        subcontractors: subcontractorList,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single subcontractor
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const subcontractor = await ctx.db.query.subcontractors.findFirst({
      where: and(eq(subcontractors.id, input.id), eq(subcontractors.tenantId, ctx.tenant.id)),
      with: {
        primaryTrade: true,
        trades: {
          with: {
            trade: true,
          },
        },
        assignedTasks: {
          where: eq(sql`status`, 'in_progress'),
          limit: 5,
        },
        communications: {
          orderBy: [desc(subcontractors.createdAt)],
          limit: 10,
        },
      },
    });

    if (!subcontractor) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Subcontractor not found',
      });
    }

    return subcontractor;
  }),

  // Create subcontractor
  create: protectedProcedure.input(subcontractorCreateSchema).mutation(async ({ ctx, input }) => {
    const { primaryTradeId, ...rest } = input;

    const [subcontractor] = await ctx.db
      .insert(subcontractors)
      .values({
        tenantId: ctx.tenant.id,
        status: 'active',
        totalProjectsCompleted: 0,
        ...rest,
        insuranceCoverageAmount: rest.insuranceCoverageAmount ? rest.insuranceCoverageAmount.toString() : undefined,
        primaryTradeId: primaryTradeId || null,
      })
      .returning();

    // If a primary trade was specified, also add to the trades association table
    if (primaryTradeId && subcontractor) {
      await ctx.db.insert(subcontractorTrades).values({
        subcontractorId: subcontractor.id,
        tradeId: primaryTradeId,
        isPrimary: true,
      });
    }

    return subcontractor;
  }),

  // Update subcontractor
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: subcontractorUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.subcontractors.findFirst({
        where: and(eq(subcontractors.id, id), eq(subcontractors.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcontractor not found',
        });
      }

      const { rating, qualityScore, insuranceCoverageAmount, ...restData } = data;
      
      const [updated] = await ctx.db
        .update(subcontractors)
        .set({
          ...restData,
          rating: rating !== undefined ? rating.toString() : undefined,
          qualityScore: qualityScore !== undefined ? qualityScore.toString() : undefined,
          insuranceCoverageAmount: insuranceCoverageAmount ? insuranceCoverageAmount.toString() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(subcontractors.id, id))
        .returning();

      return updated;
    }),

  // Update subcontractor rating
  updateRating: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        rating: z.number().min(1).max(5),
        onTimePercentage: z.number().min(0).max(100).optional(),
        qualityScore: z.number().min(0).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, rating, onTimePercentage, qualityScore } = input;

      const existing = await ctx.db.query.subcontractors.findFirst({
        where: and(eq(subcontractors.id, id), eq(subcontractors.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcontractor not found',
        });
      }

      const [updated] = await ctx.db
        .update(subcontractors)
        .set({
          rating: rating?.toString(),
          onTimePercentage,
          qualityScore: qualityScore?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(subcontractors.id, id))
        .returning();

      return updated;
    }),

  // Delete subcontractor
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.subcontractors.findFirst({
        where: and(eq(subcontractors.id, input.id), eq(subcontractors.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcontractor not found',
        });
      }

      await ctx.db.delete(subcontractors).where(eq(subcontractors.id, input.id));

      return { success: true };
    }),

  // Add trade to subcontractor
  addTrade: protectedProcedure
    .input(
      z.object({
        subcontractorId: z.string().uuid(),
        tradeId: z.string().uuid(),
        isPrimary: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { subcontractorId, tradeId, isPrimary } = input;

      const existing = await ctx.db.query.subcontractors.findFirst({
        where: and(eq(subcontractors.id, subcontractorId), eq(subcontractors.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcontractor not found',
        });
      }

      const [association] = await ctx.db
        .insert(subcontractorTrades)
        .values({
          subcontractorId,
          tradeId,
          isPrimary,
        })
        .returning();

      // If this is the primary trade, update the subcontractor record
      if (isPrimary) {
        await ctx.db
          .update(subcontractors)
          .set({ primaryTradeId: tradeId, updatedAt: new Date() })
          .where(eq(subcontractors.id, subcontractorId));
      }

      return association;
    }),

  // Remove trade from subcontractor
  removeTrade: protectedProcedure
    .input(
      z.object({
        subcontractorId: z.string().uuid(),
        tradeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { subcontractorId, tradeId } = input;

      await ctx.db
        .delete(subcontractorTrades)
        .where(
          and(
            eq(subcontractorTrades.subcontractorId, subcontractorId),
            eq(subcontractorTrades.tradeId, tradeId)
          )
        );

      return { success: true };
    }),
});

// Trades router
export const tradesRouter = router({
  // List all trades
  list: protectedProcedure.query(async ({ ctx }) => {
    const tradeList = await ctx.db.query.trades.findMany({
      where: eq(trades.tenantId, ctx.tenant.id),
      orderBy: [trades.sortOrder, trades.name],
    });

    return tradeList;
  }),

  // Get single trade
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const trade = await ctx.db.query.trades.findFirst({
      where: and(eq(trades.id, input.id), eq(trades.tenantId, ctx.tenant.id)),
      with: {
        subcontractorTrades: {
          with: {
            subcontractor: true,
          },
        },
      },
    });

    if (!trade) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Trade not found',
      });
    }

    return trade;
  }),

  // Create trade
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        category: z.enum([
          'general_contractor',
          'electrical',
          'plumbing',
          'hvac',
          'roofing',
          'framing',
          'concrete',
          'flooring',
          'painting',
          'landscaping',
          'excavation',
          'insulation',
          'drywall',
          'cabinets',
          'countertops',
          'windows_doors',
          'appliances',
          'cleaning',
          'other',
        ]),
        description: z.string().optional(),
        typicalDurationDays: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [trade] = await ctx.db
        .insert(trades)
        .values({
          tenantId: ctx.tenant.id,
          ...input,
        })
        .returning();

      return trade;
    }),

  // Update trade
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(2).optional(),
          description: z.string().optional(),
          typicalDurationDays: z.number().int().positive().optional(),
          sortOrder: z.number().int().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.trades.findFirst({
        where: and(eq(trades.id, id), eq(trades.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trade not found',
        });
      }

      const [updated] = await ctx.db
        .update(trades)
        .set(data)
        .where(eq(trades.id, id))
        .returning();

      return updated;
    }),

  // Delete trade
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.trades.findFirst({
        where: and(eq(trades.id, input.id), eq(trades.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trade not found',
        });
      }

      await ctx.db.delete(trades).where(eq(trades.id, input.id));

      return { success: true };
    }),
});
