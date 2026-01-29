import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { taskCreateSchema, taskUpdateSchema, paginationSchema } from '@enterprise/shared';
import { tasks, projects } from '@enterprise/db/schema';
import { eq, and, desc, inArray, ilike, or } from '@enterprise/db';

export const tasksRouter = router({
  // List tasks (optionally filtered by project)
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          projectId: z.string().uuid().optional(),
          projectPhaseId: z.string().uuid().optional(),
          assigneeId: z.string().uuid().optional(),
          assignedSubcontractorId: z.string().uuid().optional(),
          tradeId: z.string().uuid().optional(),
          status: z.enum(['pending', 'scheduled', 'in_progress', 'inspection', 'completed', 'blocked']).optional(),
          priority: z.enum(['low', 'normal', 'urgent', 'critical']).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        page = 1,
        pageSize = 50,
        projectId,
        projectPhaseId,
        assigneeId,
        assignedSubcontractorId,
        tradeId,
        status,
        priority,
        search,
      } = input || {};
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

      if (projectPhaseId) {
        const combined = and(whereClause, eq(tasks.projectPhaseId, projectPhaseId));
        if (combined) whereClause = combined;
      }

      if (assigneeId) {
        const combined = and(whereClause, eq(tasks.assignedToId, assigneeId));
        if (combined) whereClause = combined;
      }

      if (assignedSubcontractorId) {
        const combined = and(whereClause, eq(tasks.assignedSubcontractorId, assignedSubcontractorId));
        if (combined) whereClause = combined;
      }

      if (tradeId) {
        const combined = and(whereClause, eq(tasks.tradeId, tradeId));
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

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(tasks.title, `%${search}%`),
            ilike(tasks.description || '', `%${search}%`),
            ilike(tasks.poNumber || '', `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      const taskList = await ctx.db.query.tasks.findMany({
        where: whereClause,
        orderBy: [desc(tasks.priority), desc(tasks.scheduledDate), desc(tasks.createdAt)],
        limit: pageSize,
        offset,
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          assignedSubcontractor: {
            columns: {
              id: true,
              companyName: true,
            },
          },
          project: {
            columns: {
              id: true,
              name: true,
            },
          },
          trade: {
            columns: {
              id: true,
              name: true,
              category: true,
            },
          },
          projectPhase: {
            columns: {
              id: true,
              phase: true,
            },
          },
        },
      });

      // Count total
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(whereClause);

      const total = countResult?.count || 0;

      return {
        items: taskList,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single task
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const task = await ctx.db.query.tasks.findFirst({
      where: eq(tasks.id, input.id),
      with: {
        assignedTo: {
          columns: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        assignedSubcontractor: {
          columns: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        project: {
          columns: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
        trade: {
          columns: {
            id: true,
            name: true,
            category: true,
          },
        },
        projectPhase: {
          columns: {
            id: true,
            phase: true,
          },
        },
      },
    });

    if (!task || task.project?.tenantId !== ctx.tenant.id) {
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
        estimatedCost: input.estimatedCost ? input.estimatedCost.toString() : undefined,
        status: 'pending',
        sortOrder: (maxSort?.sortOrder || 0) + 1,
        actualCost: '0',
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
      if (data.status === 'completed' && existing.status !== 'completed') {
        updateData.completedAt = new Date();
      } else if (data.status && data.status !== 'completed') {
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
        status: z.enum(['pending', 'scheduled', 'in_progress', 'inspection', 'completed', 'blocked']),
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

      if (status === 'completed') {
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

      if (!task || task.project?.tenantId !== ctx.tenant.id) {
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

      if (!task || task.project?.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      await ctx.db.delete(tasks).where(eq(tasks.id, input.id));

      return { success: true };
    }),

  // Mark inspection status
  updateInspection: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        inspectionStatus: z.enum(['scheduled', 'passed', 'failed']),
        inspectionDate: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, inspectionStatus, inspectionDate } = input;

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
        inspectionStatus,
        updatedAt: new Date(),
      };

      if (inspectionDate) {
        updateData.inspectionDate = inspectionDate;
      }

      // If passed, mark task as completed
      if (inspectionStatus === 'passed') {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      }

      const [updated] = await ctx.db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      return updated;
    }),
});

// Import sql for count
import { sql } from '@enterprise/db';
