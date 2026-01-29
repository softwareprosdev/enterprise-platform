import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Home, MapPin, Calendar, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, formatDate, formatCurrency, statusColors, phaseLabels } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: stats } = trpc.projects.stats.useQuery({ id: projectId });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-6 text-destructive">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/projects" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[project.status])}>
              {project.status}
            </span>
          </div>
          <p className="text-muted-foreground">{project.projectNumber}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Project Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {project.address}<br />
                    {project.city}, {project.state} {project.zipCode}
                  </p>
                </div>
              </div>
              {project.homeowner && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Homeowner</p>
                    <p className="text-sm text-muted-foreground">
                      {project.homeowner.firstName} {project.homeowner.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{project.homeowner.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Specs</p>
                  <p className="text-sm text-muted-foreground">
                    {project.squareFootage} sq ft • {project.bedrooms} bed • {project.bathrooms} bath
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    {project.estimatedStartDate ? formatDate(project.estimatedStartDate) : 'TBD'} → {project.estimatedCompletionDate ? formatDate(project.estimatedCompletionDate) : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Construction Phases</h2>
            <div className="space-y-2">
              {project.phases?.map((phase) => (
                <div key={phase.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      phase.isCompleted ? 'bg-success' : phase.isActive ? 'bg-primary' : 'bg-muted-foreground'
                    )} />
                    <span className="text-sm font-medium">
                      {project.currentPhase && phaseLabels[phase.phase] ? phaseLabels[phase.phase] : phase.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {phase.actualStartDate && <span>{formatDate(phase.actualStartDate)}</span>}
                    {phase.isCompleted && <CheckCircle2 className="w-4 h-4 text-success" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Recent Tasks</h2>
            {project.tasks && project.tasks.length > 0 ? (
              <div className="space-y-2">
                {project.tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.trade?.name || 'No trade'}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[task.status])}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Budget Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Contract Amount</span>
                  <span className="font-medium">{formatCurrency(project.contractAmount || 0)}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-medium">{formatCurrency(project.totalSpent || 0)}</span>
                </div>
                {stats?.budget && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(stats.budget.percentUsed, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-success">
                    {stats?.budget ? formatCurrency(stats.budget.remaining) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium">
                    {stats?.tasks?.completed || 0} / {stats?.tasks?.total || 0}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${stats?.tasks?.progress || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Phases</span>
                  <span className="font-medium">
                    {stats?.phases?.completed || 0} / {stats?.phases?.total || 0}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${stats?.phases?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {project.hasRisk && project.risks && project.risks.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h2 className="font-semibold text-destructive">Active Risks</h2>
              </div>
              <div className="space-y-2">
                {project.risks.slice(0, 3).map((risk) => (
                  <div key={risk.id} className="text-sm">
                    <p className="font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
