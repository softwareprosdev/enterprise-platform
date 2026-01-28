import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../router.js';
import { projectCreateSchema, projectUpdateSchema, paginationSchema } from '@enterprise/shared';
import { projects, milestones, deliverables } from '@enterprise/db/schema';
import { eq, and, desc, ilike } from '@enterprise/db';

export const projectsRouter = router({
  // List projects
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          status: z
            .enum(['draft', 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'])
            .optional(),
          clientId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20, search, status, clientId } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(projects.tenantId, ctx.tenant.id);

      if (status) {
        whereClause = and(whereClause, eq(projects.status, status))!;
      }

      if (clientId) {
        whereClause = and(whereClause, eq(projects.clientId, clientId))!;
      }

      if (search) {
        whereClause = and(whereClause, ilike(projects.name, `%${search}%`))!;
      }

      const projectList = await ctx.db.query.projects.findMany({
        where: whereClause,
        orderBy: [desc(projects.createdAt)],
        limit: pageSize,
        offset,
        with: {
          client: {
            columns: {
              id: true,
              companyName: true,
            },
          },
        },
      });

      const total = await ctx.db
        .select({ count: projects.id })
        .from(projects)
        .where(whereClause);

      return {
        items: projectList,
        total: total.length,
        page,
        pageSize,
        totalPages: Math.ceil(total.length / pageSize),
      };
    }),

  // Get single project with details
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const project = await ctx.db.query.projects.findFirst({
      where: and(eq(projects.id, input.id), eq(projects.tenantId, ctx.tenant.id)),
      with: {
        client: true,
        milestones: {
          orderBy: [milestones.sortOrder],
        },
        tasks: true,
        deliverables: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    return project;
  }),

  // Create project
  create: protectedProcedure.input(projectCreateSchema).mutation(async ({ ctx, input }) => {
    const [project] = await ctx.db
      .insert(projects)
      .values({
        tenantId: ctx.tenant.id,
        ...input,
      })
      .returning();

    return project;
  }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: projectUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date(),
      };

      // If completing, set completedAt
      if (data.status === 'completed' && existing.status !== 'completed') {
        updateData.completedAt = new Date();
      }

      const [updated] = await ctx.db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();

      return updated;
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, input.id), eq(projects.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true };
    }),

  // Get project stats
  stats: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const project = await ctx.db.query.projects.findFirst({
      where: and(eq(projects.id, input.id), eq(projects.tenantId, ctx.tenant.id)),
      with: {
        milestones: true,
        tasks: true,
        deliverables: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'done').length;
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(
      (m) => m.status === 'completed' || m.status === 'paid'
    ).length;
    const totalDeliverables = project.deliverables.length;
    const approvedDeliverables = project.deliverables.filter((d) => d.status === 'approved').length;

    const totalBudget = project.milestones.reduce(
      (sum, m) => sum + parseFloat(m.amount || '0'),
      0
    );
    const paidAmount = project.milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0);

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        progress: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      },
      deliverables: {
        total: totalDeliverables,
        approved: approvedDeliverables,
        progress: totalDeliverables > 0 ? Math.round((approvedDeliverables / totalDeliverables) * 100) : 0,
      },
      budget: {
        total: totalBudget,
        paid: paidAmount,
        remaining: totalBudget - paidAmount,
      },
    };
  }),
});
