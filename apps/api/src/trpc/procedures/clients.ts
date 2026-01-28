import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../router.js';
import { clientCreateSchema, clientUpdateSchema, paginationSchema } from '@enterprise/shared';
import { clients } from '@enterprise/db/schema';
import { eq, and, desc, ilike, or } from '@enterprise/db';

export const clientsRouter = router({
  // List clients
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          status: z.enum(['lead', 'prospect', 'onboarding', 'active', 'completed', 'churned']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20, search, status } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(clients.tenantId, ctx.tenant.id);

      if (status) {
        const combined = and(whereClause, eq(clients.status, status));
        if (combined) whereClause = combined;
      }

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(clients.companyName, `%${search}%`),
            ilike(clients.contactName, `%${search}%`),
            ilike(clients.email, `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      const clientList = await ctx.db.query.clients.findMany({
        where: whereClause,
        orderBy: [desc(clients.createdAt)],
        limit: pageSize,
        offset,
      });

      const total = await ctx.db
        .select({ count: clients.id })
        .from(clients)
        .where(whereClause);

      return {
        items: clientList,
        total: total.length,
        page,
        pageSize,
        totalPages: Math.ceil(total.length / pageSize),
      };
    }),

  // Get single client
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const client = await ctx.db.query.clients.findFirst({
      where: and(eq(clients.id, input.id), eq(clients.tenantId, ctx.tenant.id)),
      with: {
        projects: true,
      },
    });

    if (!client) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Client not found',
      });
    }

    return client;
  }),

  // Create client
  create: protectedProcedure.input(clientCreateSchema).mutation(async ({ ctx, input }) => {
    const [client] = await ctx.db
      .insert(clients)
      .values({
        tenantId: ctx.tenant.id,
        ...input,
      })
      .returning();

    return client;
  }),

  // Update client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: clientUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.clients.findFirst({
        where: and(eq(clients.id, id), eq(clients.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found',
        });
      }

      const [updated] = await ctx.db
        .update(clients)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();

      return updated;
    }),

  // Update client status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['lead', 'prospect', 'onboarding', 'active', 'completed', 'churned']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;

      const existing = await ctx.db.query.clients.findFirst({
        where: and(eq(clients.id, id), eq(clients.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found',
        });
      }

      const [updated] = await ctx.db
        .update(clients)
        .set({ status, updatedAt: new Date() })
        .where(eq(clients.id, id))
        .returning();

      return updated;
    }),

  // Delete client
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.clients.findFirst({
        where: and(eq(clients.id, input.id), eq(clients.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found',
        });
      }

      await ctx.db.delete(clients).where(eq(clients.id, input.id));

      return { success: true };
    }),
});
