import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { communicationCreateSchema, communicationUpdateSchema, paginationSchema } from '@enterprise/shared';
import { communications, callTranscriptions } from '@enterprise/db/schema';
import { eq, and, desc, ilike, or, sql, gte, lte } from '@enterprise/db';

export const communicationsRouter = router({
  // List communications
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          type: z.enum([
            'call_inbound',
            'call_outbound',
            'call_missed',
            'call_voicemail',
            'sms_inbound',
            'sms_outbound',
            'email_inbound',
            'email_outbound',
          ]).optional(),
          status: z.enum(['completed', 'pending_follow_up', 'urgent', 'archived']).optional(),
          urgent: z.boolean().optional(),
          projectId: z.string().uuid().optional(),
          homeownerId: z.string().uuid().optional(),
          subcontractorId: z.string().uuid().optional(),
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        page = 1,
        pageSize = 20,
        search,
        type,
        status,
        urgent,
        projectId,
        homeownerId,
        subcontractorId,
        startDate,
        endDate,
      } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(communications.tenantId, ctx.tenant.id);

      if (type) {
        const combined = and(whereClause, eq(communications.type, type));
        if (combined) whereClause = combined;
      }

      if (status) {
        const combined = and(whereClause, eq(communications.status, status));
        if (combined) whereClause = combined;
      }

      if (urgent !== undefined) {
        const combined = and(whereClause, eq(communications.status, 'urgent'));
        if (combined) whereClause = combined;
      }

      if (projectId) {
        const combined = and(whereClause, eq(communications.projectId, projectId));
        if (combined) whereClause = combined;
      }

      if (homeownerId) {
        const combined = and(whereClause, eq(communications.homeownerId, homeownerId));
        if (combined) whereClause = combined;
      }

      if (subcontractorId) {
        const combined = and(whereClause, eq(communications.subcontractorId, subcontractorId));
        if (combined) whereClause = combined;
      }

      if (startDate) {
        const combined = and(whereClause, gte(communications.createdAt, startDate));
        if (combined) whereClause = combined;
      }

      if (endDate) {
        const combined = and(whereClause, lte(communications.createdAt, endDate));
        if (combined) whereClause = combined;
      }

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(communications.body || '', `%${search}%`),
            ilike(communications.fromNumber || '', `%${search}%`),
            ilike(communications.toNumber || '', `%${search}%`),
            ilike(communications.fromEmail || '', `%${search}%`),
            ilike(communications.toEmail || '', `%${search}%`),
            ilike(communications.aiSummary || '', `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      const communicationList = await ctx.db.query.communications.findMany({
        where: whereClause,
        orderBy: [desc(communications.createdAt)],
        limit: pageSize,
        offset,
        with: {
          project: {
            columns: { id: true, name: true },
          },
          homeowner: {
            columns: { id: true, firstName: true, lastName: true },
          },
          subcontractor: {
            columns: { id: true, companyName: true },
          },
          transcriptions: {
            orderBy: [callTranscriptions.startTimeSeconds],
          },
        },
      });

      // Count total for pagination
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(communications)
        .where(whereClause);

      // Count urgent communications
      const [urgentCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(communications)
        .where(and(eq(communications.tenantId, ctx.tenant.id), eq(communications.status, 'urgent')));

      const total = countResult?.count || 0;

      return {
        communications: communicationList,
        urgentCount: urgentCount?.count || 0,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single communication
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const communication = await ctx.db.query.communications.findFirst({
      where: and(eq(communications.id, input.id), eq(communications.tenantId, ctx.tenant.id)),
      with: {
        project: true,
        homeowner: true,
        subcontractor: true,
        transcriptions: {
          orderBy: [callTranscriptions.startTimeSeconds],
        },
      },
    });

    if (!communication) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Communication not found',
      });
    }

    return communication;
  }),

  // Create communication
  create: protectedProcedure.input(communicationCreateSchema).mutation(async ({ ctx, input }) => {
    const [communication] = await ctx.db
      .insert(communications)
      .values({
        tenantId: ctx.tenant.id,
        status: 'completed',
        ...input,
      })
      .returning();

    return communication;
  }),

  // Update communication
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: communicationUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.communications.findFirst({
        where: and(eq(communications.id, id), eq(communications.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Communication not found',
        });
      }

      const [updated] = await ctx.db
        .update(communications)
        .set(data)
        .where(eq(communications.id, id))
        .returning();

      return updated;
    }),

  // Mark as followed up
  markFollowedUp: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existing = await ctx.db.query.communications.findFirst({
        where: and(eq(communications.id, id), eq(communications.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Communication not found',
        });
      }

      const [updated] = await ctx.db
        .update(communications)
        .set({
          status: 'completed',
          followedUpAt: new Date(),
          requiresFollowUp: false,
        })
        .where(eq(communications.id, id))
        .returning();

      return updated;
    }),

  // Add transcription segment
  addTranscription: protectedProcedure
    .input(
      z.object({
        communicationId: z.string().uuid(),
        speaker: z.string(),
        text: z.string(),
        confidence: z.number().optional(),
        startTimeSeconds: z.number().optional(),
        endTimeSeconds: z.number().optional(),
        sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
        keywords: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { communicationId, ...rest } = input;

      const existing = await ctx.db.query.communications.findFirst({
        where: and(eq(communications.id, communicationId), eq(communications.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Communication not found',
        });
      }

      const [transcription] = await ctx.db
        .insert(callTranscriptions)
        .values({
          communicationId,
          ...rest,
        })
        .returning();

      return transcription;
    }),

  // Delete communication
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.communications.findFirst({
        where: and(eq(communications.id, input.id), eq(communications.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Communication not found',
        });
      }

      await ctx.db.delete(communications).where(eq(communications.id, input.id));

      return { success: true };
    }),

  // Get communication stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's stats
    const [todayCalls] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(communications)
      .where(
        and(
          eq(communications.tenantId, ctx.tenant.id),
          gte(communications.createdAt, today),
          sql`type LIKE 'call%'`
        )
      );

    const [todaySms] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(communications)
      .where(
        and(
          eq(communications.tenantId, ctx.tenant.id),
          gte(communications.createdAt, today),
          sql`type LIKE 'sms%'`
        )
      );

    const [missedCalls] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(communications)
      .where(
        and(
          eq(communications.tenantId, ctx.tenant.id),
          gte(communications.createdAt, today),
          eq(communications.type, 'call_missed')
        )
      );

    const [urgentCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(communications)
      .where(
        and(
          eq(communications.tenantId, ctx.tenant.id),
          eq(communications.status, 'urgent')
        )
      );

    return {
      today: {
        calls: todayCalls?.count || 0,
        sms: todaySms?.count || 0,
        missedCalls: missedCalls?.count || 0,
      },
      urgentPending: urgentCount?.count || 0,
    };
  }),
});
