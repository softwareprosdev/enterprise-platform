import { router, protectedProcedure } from '../router.js';
import { clients, projects, tasks, milestones, activityLogs, users } from '@enterprise/db/schema';
import { eq, and, desc, sql, gte, inArray } from '@enterprise/db';

export const dashboardRouter = router({
  // Get dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    // Get counts
    const [clientCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(eq(clients.tenantId, ctx.tenant.id));

    const [activeProjectCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(
          eq(projects.tenantId, ctx.tenant.id),
          inArray(projects.status, ['planning', 'in_progress', 'review'])
        )
      );

    const [completedProjectCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(eq(projects.tenantId, ctx.tenant.id), eq(projects.status, 'completed')));

    // Get pending tasks count (across all tenant projects)
    const tenantProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { id: true },
    });
    const projectIds = tenantProjects.map((p) => p.id);

    let pendingTaskCount = 0;
    if (projectIds.length > 0) {
      const [taskCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(
          and(inArray(tasks.projectId, projectIds), inArray(tasks.status, ['todo', 'in_progress']))
        );
      pendingTaskCount = taskCount?.count || 0;
    }

    // Get revenue stats from milestones
    let revenue = 0;
    let pendingPayments = 0;
    if (projectIds.length > 0) {
      const milestoneStats = await ctx.db.query.milestones.findMany({
        where: inArray(milestones.projectId, projectIds),
        columns: { amount: true, status: true },
      });

      for (const m of milestoneStats) {
        const amount = parseFloat(m.amount || '0');
        if (m.status === 'paid') {
          revenue += amount;
        } else if (m.status === 'completed') {
          pendingPayments += amount;
        }
      }
    }

    return {
      totalClients: clientCount?.count || 0,
      activeProjects: activeProjectCount?.count || 0,
      completedProjects: completedProjectCount?.count || 0,
      pendingTasks: pendingTaskCount,
      revenue,
      pendingPayments,
    };
  }),

  // Get recent activity
  recentActivity: protectedProcedure.query(async ({ ctx }) => {
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
      createdAt: activity.createdAt,
    }));
  }),

  // Get project status breakdown
  projectsByStatus: protectedProcedure.query(async ({ ctx }) => {
    const projectList = await ctx.db.query.projects.findMany({
      where: eq(projects.tenantId, ctx.tenant.id),
      columns: { status: true },
    });

    const statusCounts: Record<string, number> = {
      draft: 0,
      planning: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0,
    };

    for (const project of projectList) {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
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
        { status: 'backlog', count: 0 },
        { status: 'todo', count: 0 },
        { status: 'in_progress', count: 0 },
        { status: 'in_review', count: 0 },
        { status: 'done', count: 0 },
      ];
    }

    const taskList = await ctx.db.query.tasks.findMany({
      where: inArray(tasks.projectId, projectIds),
      columns: { status: true },
    });

    const statusCounts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
    };

    for (const task of taskList) {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }),

  // Get revenue over time (last 6 months)
  revenueOverTime: protectedProcedure.query(async ({ ctx }) => {
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

    const paidMilestones = await ctx.db.query.milestones.findMany({
      where: and(
        inArray(milestones.projectId, projectIds),
        eq(milestones.status, 'paid'),
        gte(milestones.paidAt, sixMonthsAgo)
      ),
      columns: { amount: true, paidAt: true },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};

    for (const milestone of paidMilestones) {
      if (milestone.paidAt) {
        const monthKey = `${milestone.paidAt.getFullYear()}-${String(milestone.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + parseFloat(milestone.amount || '0');
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
        revenue: monthlyRevenue[monthKey] || 0,
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
      return [];
    }

    // Get upcoming milestone deadlines
    const upcomingMilestones = await ctx.db.query.milestones.findMany({
      where: and(
        inArray(milestones.projectId, projectIds),
        inArray(milestones.status, ['pending', 'in_progress']),
        gte(milestones.dueDate, now)
      ),
      with: {
        project: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [milestones.dueDate],
      limit: 5,
    });

    // Get upcoming task deadlines
    const upcomingTasks = await ctx.db.query.tasks.findMany({
      where: and(
        inArray(tasks.projectId, projectIds),
        inArray(tasks.status, ['todo', 'in_progress']),
        gte(tasks.dueDate, now)
      ),
      with: {
        project: {
          columns: { id: true, name: true },
        },
        assignee: {
          columns: { id: true, name: true, avatar: true },
        },
      },
      orderBy: [tasks.dueDate],
      limit: 5,
    });

    return {
      milestones: upcomingMilestones.map((m) => ({
        id: m.id,
        name: m.name,
        dueDate: m.dueDate,
        amount: m.amount,
        project: m.project,
      })),
      tasks: upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        project: t.project,
        assignee: t.assignee,
      })),
    };
  }),

  // Get team members
  teamMembers: protectedProcedure.query(async ({ ctx }) => {
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
});
