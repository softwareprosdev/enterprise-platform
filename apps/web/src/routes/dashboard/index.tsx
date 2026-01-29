import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  HardHat,
  Wrench,
  Phone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  CheckSquare,
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
import { cn, formatCurrency, formatCompact, formatRelativeTime, statusColors, formatDate, phaseLabels } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const CHART_COLORS = ['#1e3a5f', '#e85d04', '#22c55e', '#f59e0b', '#8b5cf6'];

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: projectsByPhase } = trpc.dashboard.projectsByPhase.useQuery();
  const { data: revenueOverTime } = trpc.dashboard.revenueOverTime.useQuery();
  const { data: recentActivity } = trpc.dashboard.recentActivity.useQuery();
  const { data: upcomingDeadlines } = trpc.dashboard.upcomingDeadlines.useQuery();
  const { data: urgentCommunications } = trpc.dashboard.urgentCommunications.useQuery();
  const { data: projectsAtRisk } = trpc.dashboard.projectsAtRisk.useQuery();

  const statCards = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects ?? 0,
      icon: Home,
      color: 'text-[#1e3a5f]',
      bgColor: 'bg-[#1e3a5f]/10',
      change: '+5%',
      changeType: 'positive',
    },
    {
      label: 'Homeowners',
      value: stats?.totalHomeowners ?? 0,
      icon: Users,
      color: 'text-[#e85d04]',
      bgColor: 'bg-[#e85d04]/10',
      change: '+12%',
      changeType: 'positive',
    },
    {
      label: 'Subcontractors',
      value: stats?.totalSubcontractors ?? 0,
      icon: HardHat,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+3%',
      changeType: 'positive',
    },
    {
      label: 'Pending Tasks',
      value: stats?.pendingTasks ?? 0,
      icon: CheckSquare,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: stats?.blockedTasks ? `-${stats.blockedTasks} blocked` : '0 blocked',
      changeType: 'negative',
    },
    {
      label: 'Active Contracts',
      value: formatCurrency(stats?.activeContractValue ?? 0),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+8%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Command Center</h1>
        <p className="text-muted-foreground">Overview of Villa Homes operations</p>
      </div>

      {/* Critical alerts */}
      {(projectsAtRisk?.length || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <span className="font-medium text-red-500">{projectsAtRisk?.length} project{projectsAtRisk?.length !== 1 ? 's' : ''}</span>
            <span className="text-muted-foreground ml-2">with detected risks</span>
          </div>
          <Link
            to="/dashboard/projects"
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            View projects
          </Link>
        </motion.div>
      )}

      {/* Urgent communications */}
      {(urgentCommunications?.length || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-yellow-500">
              {urgentCommunications?.length} urgent communication{urgentCommunications?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {urgentCommunications?.slice(0, 3).map((comm) => (
              <Link
                key={comm.id}
                to="/dashboard/communications"
                className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comm.contactName || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">
                    {comm.detectedRisk && 'Risk detected'}
                    {comm.aiSummary && ' AI analyzed'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comm.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 hover:border-[#1e3a5f]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div
                className={cn(
                  'flex items-center text-sm font-medium',
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-yellow-500'
                )}
              >
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
            <h2 className="font-semibold">Cash Position</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Contract Value:</span>
              <span className="text-green-500 font-medium">
                {formatCurrency(stats?.activeContractValue ?? 0)}
              </span>
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
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
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
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Area
                  type="monotone"
                  dataKey="billed"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={0}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Projects by phase pie chart */}
        <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Projects by Phase</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsByPhase?.filter((s) => s.count > 0) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {projectsByPhase?.map((_, index) => (
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
            {projectsByPhase?.slice(0, 4).map((phase, i) => (
              <div key={phase.phase} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-muted-foreground">
                  {phaseLabels[phase.phase] || phase.phase.replace('_', ' ')}
                </span>
                <span className="font-medium">{phase.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <motion.div {...fadeInvUp} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming Deadlines</h2>
            <Link
              to="/dashboard/tasks"
              className="text-sm text-[#1e3a5f] hover:text-[#1e3a5f]/80"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {!upcomingDeadlines?.tasks?.length && !upcomingDeadlines?.inspections?.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No upcoming deadlines</p>
            ) : (
              <>
                {upcomingDeadlines?.inspections?.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{inspection.type} Inspection</p>
                        <p className="text-xs text-muted-foreground">{inspection.project.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'badge text-xs',
                        new Date(inspection.scheduledDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      )}>
                        {formatDate(inspection.scheduledDate)}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingDeadlines?.tasks?.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        statusColors[task.priority]
                      )}>
                        {task.priority}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(task.scheduledDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Active projects quick view */}
        <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Active Projects</h2>
            <Link
              to="/dashboard/projects"
              className="text-sm text-[#1e3a5f] hover:text-[#1e3a5f]/80"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {!stats?.recentActiveProjects?.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No active projects</p>
            ) : (
              stats.recentActiveProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/dashboard/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.address}, {project.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      statusColors[project.currentPhase]
                    )}>
                      {phaseLabels[project.currentPhase] || project.currentPhase}
                    </span>
                    {project.hasRisk && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500">Risk</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div {...fadeInUp} className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity?.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivity?.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#1e3a5f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || 'System'}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    {activity.project && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.project.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
