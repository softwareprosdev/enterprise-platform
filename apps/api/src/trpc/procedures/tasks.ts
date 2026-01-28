import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { taskCreateSchema, taskUpdateSchema, paginationSchema } from '@enterprise/shared';
import { tasks, projects } from '@enterprise/db/schema';
import { eq, and, desc, inArray } from '@enterprise/db';

export const tasksRouter = router({
  // List tasks (optionally filtered by project)
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          projectId: z.string().uuid().optional(),
          milestoneId: z.string().uuid().optional(),
          assigneeId: z.string().uuid().optional(),
          status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
          priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 50, projectId, milestoneId, assigneeId, status, priority } =
        input || {};
      const offset = (page - 1) * pageSize;

      // Get project IDs for this tenant
      const tenantProjects = await ctx.db.query.projects.findMany({
        where: eq(projects.tenantId, ctx.tenant.id),
        columns: { id: true },
      });
      const projectIds = tenantProjects.map((p) => p.id);

      if (projectIds.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }

      let whereClause = inArray(tasks.projectId, projectIds);

      if (projectId) {
        const combined = and(whereClause, eq(tasks.projectId, projectId));
        if (combined) whereClause = combined;
      }

      if (milestoneId) {
        const combined = and(whereClause, eq(tasks.milestoneId, milestoneId));
        if (combined) whereClause = combined;
      }

      if (assigneeId) {
        const combined = and(whereClause, eq(tasks.assigneeId, assigneeId));
        if (combined) whereClause = combined;
      }

      if (status) {
        const combined = and(whereClause, eq(tasks.status, status));
        if (combined) whereClause = combined;
      }

      if (priority) {
        const combined = and(whereClause, eq(tasks.priority, priority));
        if (combined) whereClause = combined;
      }

      const taskList = await ctx.db.query.tasks.findMany({
        where: whereClause,
        orderBy: [tasks.sortOrder, desc(tasks.createdAt)],
        limit: pageSize,
        offset,
        with: {
          assignee: {
            columns: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          project: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      const total = await ctx.db.select({ count: tasks.id }).from(tasks).where(whereClause);

      return {
        items: taskList,
        total: total.length,
        page,
        pageSize,
        totalPages: Math.ceil(total.length / pageSize),
      };
    }),

  // Get single task
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const task = await ctx.db.query.tasks.findFirst({
      where: eq(tasks.id, input.id),
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        project: {
          columns: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
        milestone: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task || task.project.tenantId !== ctx.tenant.id) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    return task;
  }),

  // Create task
  create: protectedProcedure.input(taskCreateSchema).mutation(async ({ ctx, input }) => {
    // Verify project belongs to tenant
    const project = await ctx.db.query.projects.findFirst({
      where: and(eq(projects.id, input.projectId), eq(projects.tenantId, ctx.tenant.id)),
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    // Get max sort order
    const maxSort = await ctx.db.query.tasks.findFirst({
      where: eq(tasks.projectId, input.projectId),
      orderBy: [desc(tasks.sortOrder)],
      columns: { sortOrder: true },
    });

    const [task] = await ctx.db
      .insert(tasks)
      .values({
        ...input,
        sortOrder: (maxSort?.sortOrder || 0) + 1,
      })
      .returning();

    return task;
  }),

  // Update task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: taskUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const existing = await ctx.db.query.tasks.findFirst({
        where: eq(tasks.id, id),
        with: {
          project: {
            columns: { tenantId: true },
          },
        },
      });

      if (!existing || existing.project.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date(),
      };

      // If completing, set completedAt
      if (data.status === 'done' && existing.status !== 'done') {
        updateData.completedAt = new Date();
      } else if (data.status && data.status !== 'done') {
        updateData.completedAt = null;
      }

      const [updated] = await ctx.db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      return updated;
    }),

  // Bulk update task status (for kanban drag & drop)
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string().uuid()),
        status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { taskIds, status } = input;

      // Verify all tasks belong to tenant's projects
      const tasksToUpdate = await ctx.db.query.tasks.findMany({
        where: inArray(tasks.id, taskIds),
        with: {
          project: {
            columns: { tenantId: true },
          },
        },
      });

      const validTaskIds = tasksToUpdate
        .filter((t) => t.project.tenantId === ctx.tenant.id)
        .map((t) => t.id);

      if (validTaskIds.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No valid tasks found',
        });
      }

      const updateData: Record<string, unknown> = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'done') {
        updateData.completedAt = new Date();
      }

      await ctx.db.update(tasks).set(updateData).where(inArray(tasks.id, validTaskIds));

      return { updated: validTaskIds.length };
    }),

  // Reorder tasks
  reorder: protectedProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        newOrder: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { taskId, newOrder } = input;

      const task = await ctx.db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
          project: {
            columns: { tenantId: true },
          },
        },
      });

      if (!task || task.project.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      await ctx.db
        .update(tasks)
        .set({ sortOrder: newOrder, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));

      return { success: true };
    }),

  // Delete task
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.tasks.findFirst({
        where: eq(tasks.id, input.id),
        with: {
          project: {
            columns: { tenantId: true },
          },
        },
      });

      if (!task || task.project.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      await ctx.db.delete(tasks).where(eq(tasks.id, input.id));

      return { success: true };
    }),
});
