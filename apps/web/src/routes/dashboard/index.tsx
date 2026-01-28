import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Users,
  FolderKanban,
  CheckSquare,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { trpc } from '@/lib/trpc';
import { cn, formatCurrency, formatCompact, formatRelativeTime, statusColors } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6'];

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: projectsByStatus } = trpc.dashboard.projectsByStatus.useQuery();
  const { data: tasksByStatus } = trpc.dashboard.tasksByStatus.useQuery();
  const { data: revenueOverTime } = trpc.dashboard.revenueOverTime.useQuery();
  const { data: recentActivity } = trpc.dashboard.recentActivity.useQuery();
  const { data: upcomingDeadlines } = trpc.dashboard.upcomingDeadlines.useQuery();

  const statCards = [
    {
      label: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      changeType: 'positive',
    },
    {
      label: 'Active Projects',
      value: stats?.activeProjects ?? 0,
      icon: FolderKanban,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      change: '+5%',
      changeType: 'positive',
    },
    {
      label: 'Pending Tasks',
      value: stats?.pendingTasks ?? 0,
      icon: CheckSquare,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '-8%',
      changeType: 'negative',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats?.revenue ?? 0),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+23%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your agency.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div
                className={cn(
                  'flex items-center text-sm font-medium',
                  stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                )}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {statsLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : typeof stat.value === 'number' ? (
                formatCompact(stat.value)
              ) : (
                stat.value
              )}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div
          {...fadeInUp}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Revenue Overview</h2>
            <div className="flex items-center gap-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              +23% this month
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueOverTime || []}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="month" stroke="#a0a0b0" fontSize={12} />
                <YAxis stroke="#a0a0b0" fontSize={12} tickFormatter={(v) => `$${formatCompact(v)}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project status pie chart */}
        <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Projects by Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsByStatus?.filter((s) => s.count > 0) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {projectsByStatus?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {projectsByStatus?.slice(0, 4).map((status, i) => (
              <div key={status.status} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-muted-foreground capitalize">
                  {status.status.replace('_', ' ')}
                </span>
                <span className="font-medium">{status.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity?.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>
            ) : (
              recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || 'System'}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming deadlines */}
        <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {upcomingDeadlines?.milestones.length === 0 &&
            upcomingDeadlines?.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No upcoming deadlines</p>
            ) : (
              <>
                {upcomingDeadlines?.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{milestone.name}</p>
                        <p className="text-xs text-muted-foreground">{milestone.project.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(milestone.amount || 0)}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {milestone.dueDate
                          ? new Date(milestone.dueDate).toLocaleDateString()
                          : 'No date'}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingDeadlines?.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn('badge text-xs', statusColors[task.priority])}>
                        {task.priority}
                      </span>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
