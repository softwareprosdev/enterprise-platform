import { router, protectedProcedure } from '../trpc.js';
import { homeowners, projects, tasks, subcontractors, communications, scheduleRisks } from '@enterprise/db/schema';
import { eq, and, desc, sql, gte, inArray, lte } from '@enterprise/db';

export const dashboardRouter = router({
  // Get dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    // Get homeowner counts
    const [homeownerCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(homeowners)
      .where(eq(homeowners.tenantId, ctx.tenant.id));

    // Get active project count (planning, active)
    const [activeProjectCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(
          eq(projects.tenantId, ctx.tenant.id),
          inArray(projects.status, ['planning', 'active'])
        )
      );

    // Get completed project count
    const [completedProjectCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(eq(projects.tenantId, ctx.tenant.id), eq(projects.status, 'completed')));

    // Get subcontractor count
    const [subcontractorCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(subcontractors)
      .where(eq(subcontractors.tenantId, ctx.tenant.id));

    // Get pending tasks count (across all tenant projects)
    const tenantProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { id: true },
    });
    const projectIds = tenantProjects.map((p) => p.id);

    let pendingTaskCount = 0;
    let blockedTaskCount = 0;
    if (projectIds.length > 0) {
      const [taskCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(
          and(inArray(tasks.projectId, projectIds), inArray(tasks.status, ['scheduled', 'in_progress']))
        );
      pendingTaskCount = taskCount?.count || 0;

      const [blockedCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(and(inArray(tasks.projectId, projectIds), eq(tasks.status, 'blocked')));
      blockedTaskCount = blockedCount?.count || 0;
    }

    // Get active contract value
    let activeContractValue = 0;
    if (projectIds.length > 0) {
      const contractStats = await ctx.db.query.projects.findMany({
        where: and(
          eq(projects.tenantId, ctx.tenant.id),
          inArray(projects.status, ['planning', 'active'])
        ),
        columns: { contractAmount: true },
      });

      for (const p of contractStats) {
        activeContractValue += parseFloat(p.contractAmount || '0');
      }
    }

    return {
      totalHomeowners: homeownerCount?.count || 0,
      activeProjects: activeProjectCount?.count || 0,
      completedProjects: completedProjectCount?.count || 0,
      totalSubcontractors: subcontractorCount?.count || 0,
      pendingTasks: pendingTaskCount,
      blockedTasks: blockedTaskCount,
      activeContractValue,
    };
  }),

  // Get recent activity
  recentActivity: protectedProcedure.query(async ({ ctx }) => {
    const { activityLogs } = await import('@enterprise/db/schema');

    const activities = await ctx.db.query.activityLogs.findMany({
      where: eq(activityLogs.tenantId, ctx.tenant.id),
      orderBy: [desc(activityLogs.createdAt)],
      limit: 10,
      with: {
        user: {
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

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      metadata: activity.metadata,
      user: activity.user
        ? {
            id: activity.user.id,
            name: activity.user.name,
            avatar: activity.user.avatar,
          }
        : null,
      project: activity.project || null,
      createdAt: activity.createdAt,
    }));
  }),

  // Get project phase breakdown (was: projectsByStatus)
  projectsByPhase: protectedProcedure.query(async ({ ctx }) => {
    const projectList = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { currentPhase: true },
    });

    const phaseCounts: Record<string, number> = {
      pre_construction: 0,
      site_prep: 0,
      foundation: 0,
      framing: 0,
      roofing: 0,
      rough_in: 0,
      insulation: 0,
      drywall: 0,
      interior_finish: 0,
      exterior_finish: 0,
      final_completion: 0,
      warranty_period: 0,
      archived: 0,
    };

    for (const project of projectList) {
      const phase = project.currentPhase || 'pre_construction';
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
    }

    return Object.entries(phaseCounts).map(([phase, count]) => ({
      phase,
      count,
    }));
  }),

  // Get task status breakdown
  tasksByStatus: protectedProcedure.query(async ({ ctx }) => {
    const tenantProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { id: true },
    });
    const projectIds = tenantProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [
        { status: 'pending', count: 0 },
        { status: 'scheduled', count: 0 },
        { status: 'in_progress', count: 0 },
        { status: 'inspection', count: 0 },
        { status: 'completed', count: 0 },
        { status: 'blocked', count: 0 },
      ];
    }

    const taskList = await ctx.db.query.tasks.findMany({
      where: inArray(tasks.projectId, projectIds),
      columns: { status: true },
    });

    const statusCounts: Record<string, number> = {
      pending: 0,
      scheduled: 0,
      in_progress: 0,
      inspection: 0,
      completed: 0,
      blocked: 0,
    };

    for (const task of taskList) {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }),

  // Get cash flow over time (last 6 months) - billed vs collected
  revenueOverTime: protectedProcedure.query(async ({ ctx }) => {
    const { invoices } = await import('@enterprise/db/schema');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const tenantProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { id: true },
    });
    const projectIds = tenantProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    // Get invoices in last 6 months
    const projectInvoices = await ctx.db.query.invoices.findMany({
      where: and(
        inArray(invoices.projectId, projectIds),
        gte(invoices.invoiceDate, sixMonthsAgo)
      ),
      columns: { total: true, status: true, invoiceDate: true, paidAt: true },
    });

    // Group by month
    const monthlyData: Record<string, { billed: number; collected: number }> = {};

    for (const invoice of projectInvoices) {
      if (invoice.invoiceDate) {
        const monthKey = `${invoice.invoiceDate.getFullYear()}-${String(invoice.invoiceDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { billed: 0, collected: 0 };
        }
        monthlyData[monthKey].billed += parseFloat(invoice.total || '0');

        if (invoice.status === 'paid' && invoice.paidAt) {
          const paidMonthKey = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[paidMonthKey]) {
            monthlyData[paidMonthKey] = { billed: 0, collected: 0 };
          }
          monthlyData[paidMonthKey].collected += parseFloat(invoice.paidAmount || invoice.total || '0');
        }
      }
    }

    // Fill in missing months
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        month: monthKey,
        billed: monthlyData[monthKey]?.billed || 0,
        collected: monthlyData[monthKey]?.collected || 0,
      });
    }

    return result;
  }),

  // Get upcoming deadlines
  upcomingDeadlines: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const tenantProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { id: true },
    });
    const projectIds = tenantProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return { tasks: [], inspections: [] };
    }

    // Get upcoming task deadlines
    const upcomingTasks = await ctx.db.query.tasks.findMany({
      where: and(
        inArray(tasks.projectId, projectIds),
        inArray(tasks.status, ['scheduled', 'in_progress']),
        gte(tasks.scheduledDate, now),
        lte(tasks.scheduledDate, twoWeeksFromNow)
      ),
      with: {
        project: {
          columns: { id: true, name: true },
        },
        assignee: {
          columns: { id: true, name: true, avatar: true },
        },
        trade: true,
      },
      orderBy: [tasks.scheduledDate],
      limit: 5,
    });

    // Get upcoming inspections (tasks requiring inspection)
    const upcomingInspections = await ctx.db.query.tasks.findMany({
      where: and(
        inArray(tasks.projectId, projectIds),
        eq(tasks.requiresInspection, true),
        inArray(tasks.status, ['in_progress', 'inspection']),
        gte(tasks.inspectionDate, now)
      ),
      with: {
        project: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [tasks.inspectionDate],
      limit: 5,
    });

    return {
      tasks: upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        scheduledDate: t.scheduledDate,
        priority: t.priority,
        project: t.project,
        assignee: t.assignee,
        trade: t.trade,
      })),
      inspections: upcomingInspections.map((i) => ({
        id: i.id,
        type: i.title,
        scheduledDate: i.inspectionDate,
        project: i.project,
      })),
    };
  }),

  // Get urgent communications
  urgentCommunications: protectedProcedure.query(async ({ ctx }) => {
    const urgentComms = await ctx.db.query.communications.findMany({
      where: and(
        eq(communications.tenantId, ctx.tenant.id),
        eq(communications.status, 'urgent')
      ),
      orderBy: [desc(communications.createdAt)],
      limit: 10,
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
      },
    });

    return urgentComms.map((comm) => ({
      ...comm,
      contactName: comm.homeowner
        ? `${comm.homeowner.firstName} ${comm.homeowner.lastName}`
        : comm.subcontractor?.companyName || 'Unknown',
      contactType: comm.homeowner ? 'homeowner' : comm.subcontractor ? 'subcontractor' : 'unknown',
    }));
  }),

  // Get projects at risk
  projectsAtRisk: protectedProcedure.query(async ({ ctx }) => {
    const risks = await ctx.db.query.scheduleRisks.findMany({
      where: and(
        eq(scheduleRisks.status, 'open'),
        inArray(scheduleRisks.severity, ['high', 'critical'])
      ),
      with: {
        project: {
          where: eq(projects.tenantId, ctx.tenant.id),
          columns: { id: true, name: true, currentPhase: true },
        },
        affectedTrade: true,
      },
      orderBy: [desc(scheduleRisks.createdAt)],
      limit: 10,
    });

    return risks.filter((r) => r.project);
  }),

  // Get team members
  teamMembers: protectedProcedure.query(async ({ ctx }) => {
    const { users } = await import('@enterprise/db/schema');

    const members = await ctx.db.query.users.findMany({
      where: eq(users.tenantId, ctx.tenant.id),
      columns: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        lastLoginAt: true,
      },
      orderBy: [desc(users.lastLoginAt)],
      limit: 10,
    });

    return members;
  }),

  // Get recent active projects (for dashboard display)
  recentActiveProjects: protectedProcedure.query(async ({ ctx }) => {
    const projectList = await ctx.db.query.projects.findMany({
      where: and(
        eq(projects.tenantId, ctx.tenant.id),
        inArray(projects.status, ['planning', 'active'])
      ),
      orderBy: [desc(projects.createdAt)],
      limit: 5,
      with: {
        homeowner: {
          columns: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Check for risks
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

    return projectList.map((p) => ({
      ...p,
      hasRisk: projectsWithRisk.has(p.id),
    }));
  }),
});
