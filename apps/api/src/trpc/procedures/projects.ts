import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { projectCreateSchema, projectUpdateSchema, paginationSchema } from '@enterprise/shared';
import { projects, projectPhases, tasks, scheduleRisks } from '@enterprise/db/schema';
import { eq, and, desc, ilike, inArray, sql, or } from '@enterprise/db';

// Default construction phases in order
const DEFAULT_PHASES = [
  'pre_construction',
  'site_prep',
  'foundation',
  'framing',
  'roofing',
  'rough_in',
  'insulation',
  'drywall',
  'interior_finish',
  'exterior_finish',
  'final_completion',
  'warranty_period',
];

export const projectsRouter = router({
  // List projects
  list: protectedProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
          phase: z.enum([
            'pre_construction',
            'site_prep',
            'foundation',
            'framing',
            'roofing',
            'rough_in',
            'insulation',
            'drywall',
            'interior_finish',
            'exterior_finish',
            'final_completion',
            'warranty_period',
            'archived',
          ]).optional(),
          homeownerId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { page = 1, pageSize = 20, search, status, phase, homeownerId } = input || {};
      const offset = (page - 1) * pageSize;

      let whereClause = eq(projects.tenantId, ctx.tenant.id);

      if (status) {
        const combined = and(whereClause, eq(projects.status, status));
        if (combined) whereClause = combined;
      }

      if (phase) {
        const combined = and(whereClause, eq(projects.currentPhase, phase));
        if (combined) whereClause = combined;
      }

      if (homeownerId) {
        const combined = and(whereClause, eq(projects.homeownerId, homeownerId));
        if (combined) whereClause = combined;
      }

      if (search) {
        const combined = and(
          whereClause,
          or(
            ilike(projects.name, `%${search}%`),
            ilike(projects.address, `%${search}%`),
            ilike(projects.city, `%${search}%`),
            ilike(projects.projectNumber || '', `%${search}%`)
          )
        );
        if (combined) whereClause = combined;
      }

      const projectList = await ctx.db.query.projects.findMany({
        where: whereClause,
        orderBy: [desc(projects.createdAt)],
        limit: pageSize,
        offset,
        with: {
          homeowner: {
            columns: { id: true, firstName: true, lastName: true, email: true },
          },
          phases: {
            orderBy: [projectPhases.sortOrder],
          },
          tasks: {
            limit: 5,
            orderBy: [desc(tasks.createdAt)],
          },
          budgetLineItems: true,
        },
      });

      // Count total for pagination
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(whereClause);

      // Count projects at risk
      const projectIds = projectList.map((p) => p.id);
      let projectsWithRisk: Set<string> = new Set();

      if (projectIds.length > 0) {
        const risks = await ctx.db.query.scheduleRisks.findMany({
          where: and(
            inArray(scheduleRisks.projectId, projectIds),
            eq(scheduleRisks.status, 'open')
          ),
          columns: { projectId: true },
        });
        projectsWithRisk = new Set(risks.map((r) => r.projectId));
      }

      // Calculate remaining budget and phase progress
      const projectsWithMetrics = projectList.map((p) => {
        const totalSpent = p.budgetLineItems?.reduce(
          (sum, item) => sum + parseFloat(item.actualAmount || '0'),
          0
        ) || 0;

        const totalBudget = parseFloat(p.budgetTotal || '0') || 0;
        const remainingBudget = totalBudget - totalSpent;

        // Calculate phase progress
        const currentPhaseIndex = DEFAULT_PHASES.indexOf(p.currentPhase || '');
        const phaseProgress = p.currentPhase && currentPhaseIndex >= 0
          ? Math.round((currentPhaseIndex / DEFAULT_PHASES.length) * 100)
          : 0;

        // Calculate days remaining
        const estimatedCompletion = p.estimatedCompletionDate;
        const daysRemaining = estimatedCompletion
          ? Math.ceil(
              (new Date(estimatedCompletion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
          : undefined;

        return {
          ...p,
          hasRisk: projectsWithRisk.has(p.id),
          totalSpent,
          remainingBudget,
          phaseProgress,
          daysRemaining,
        };
      });

      const total = countResult?.count || 0;
      const projectsAtRisk = projectsWithRisk.size;

      return {
        projects: projectsWithMetrics,
        projectsAtRisk,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single project with details
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const project = await ctx.db.query.projects.findFirst({
      where: and(eq(projects.id, input.id), eq(projects.tenantId, ctx.tenant.id)),
      with: {
        homeowner: true,
        projectManager: true,
        phases: {
          orderBy: [projectPhases.sortOrder],
          with: {
            completedBy: {
              columns: { id: true, name: true },
            },
          },
        },
        tasks: {
          with: {
            assignee: {
              columns: { id: true, name: true },
            },
            assignedSubcontractor: {
              columns: { id: true, companyName: true },
            },
            trade: true,
          },
        },
        budgetLineItems: {
          with: {
            trade: true,
            subcontractor: {
              columns: { id: true, companyName: true },
            },
          },
        },
        communications: {
          orderBy: [desc(projects.createdAt)],
          limit: 10,
        },
        changeOrders: {
          orderBy: [desc(projects.createdAt)],
        },
        dailyLogs: {
          orderBy: [desc(projects.createdAt)],
          limit: 5,
        },
      },
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    // Check for risks
    const risks = await ctx.db.query.scheduleRisks.findMany({
      where: and(
        eq(scheduleRisks.projectId, input.id),
        eq(scheduleRisks.status, 'open')
      ),
      orderBy: [desc(scheduleRisks.severity)],
    });

    return {
      ...project,
      hasRisk: risks.length > 0,
      risks,
    };
  }),

  // Create project
  create: protectedProcedure.input(projectCreateSchema).mutation(async ({ ctx, input }) => {
    const { homeownerId, ...projectData } = input;

    // Generate project number if not provided
    const projectNumber = input.projectNumber || generateProjectNumber();

    const [project] = await ctx.db
      .insert(projects)
      .values({
        tenantId: ctx.tenant.id,
        homeownerId: homeownerId || null,
        projectNumber,
        status: 'planning',
        currentPhase: 'pre_construction',
        totalSpent: '0',
        totalInvoiced: '0',
        totalPaid: '0',
        ...projectData,
      })
      .returning();

    // Create default project phases
    for (let i = 0; i < DEFAULT_PHASES.length; i++) {
      await ctx.db.insert(projectPhases).values({
        projectId: project.id,
        phase: DEFAULT_PHASES[i] as typeof projectPhases.phase.enumValues[number],
        sortOrder: i,
      });
    }

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

      // If completing, set actualCompletionDate
      if (data.status === 'completed' && existing.status !== 'completed') {
        updateData.actualCompletionDate = new Date();
        updateData.currentPhase = 'archived';
      }

      const [updated] = await ctx.db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();

      return updated;
    }),

  // Update project phase
  updatePhase: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        phase: z.enum([
          'pre_construction',
          'site_prep',
          'foundation',
          'framing',
          'roofing',
          'rough_in',
          'insulation',
          'drywall',
          'interior_finish',
          'exterior_finish',
          'final_completion',
          'warranty_period',
          'archived',
        ]),
        isActive: z.boolean().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, phase, isActive, isCompleted } = input;

      const existing = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.tenantId, ctx.tenant.id)),
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Update the project's current phase
      await ctx.db
        .update(projects)
        .set({
          currentPhase: phase,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id));

      // Find the phase record
      const phaseRecord = await ctx.db.query.projectPhases.findFirst({
        where: and(
          eq(projectPhases.projectId, id),
          eq(projectPhases.phase, phase)
        ),
      });

      if (phaseRecord) {
        const phaseUpdate: Record<string, unknown> = {};

        if (isActive !== undefined) {
          phaseUpdate.isActive = isActive;
          if (isActive) {
            phaseUpdate.actualStartDate = new Date();
          }
        }

        if (isCompleted !== undefined) {
          phaseUpdate.isCompleted = isCompleted;
          if (isCompleted) {
            phaseUpdate.completedAt = new Date();
            phaseUpdate.completedBy = ctx.user.id;
          }
        }

        await ctx.db
          .update(projectPhases)
          .set(phaseUpdate)
          .where(eq(projectPhases.id, phaseRecord.id));
      }

      return { success: true };
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
        phases: true,
        tasks: true,
        budgetLineItems: true,
        invoices: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length;
    const totalPhases = project.phases.length;
    const completedPhases = project.phases.filter((p) => p.isCompleted).length;

    // Budget stats
    const totalBudget = parseFloat(project.budgetTotal || '0') || project.budgetLineItems?.reduce(
      (sum, item) => sum + parseFloat(item.estimatedAmount || '0'),
      0
    ) || 0;

    const totalSpent = parseFloat(project.totalSpent || '0') || project.budgetLineItems?.reduce(
      (sum, item) => sum + parseFloat(item.actualAmount || '0'),
      0
    ) || 0;

    const totalInvoiced = parseFloat(project.totalInvoiced || '0');
    const totalPaid = parseFloat(project.totalPaid || '0');

    // Get risks
    const risks = await ctx.db.query.scheduleRisks.findMany({
      where: and(eq(scheduleRisks.projectId, input.id), eq(scheduleRisks.status, 'open')),
    });

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      phases: {
        total: totalPhases,
        completed: completedPhases,
        progress: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0,
      },
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining: totalBudget - totalSpent,
        percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        invoiced: totalInvoiced,
        paid: totalPaid,
        balance: totalInvoiced - totalPaid,
      },
      risks: {
        total: risks.length,
        high: risks.filter((r) => r.severity === 'high' || r.severity === 'critical').length,
      },
    };
  }),
});

// Helper function to generate project number
function generateProjectNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VH-${year}-${month}-${random}`;
}
