import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Mail, Phone, Home } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, formatDate, formatCurrency, statusColors, formatPhoneNumber } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/homeowners/$homeownerId')({
  component: HomeownerDetail,
});

function HomeownerDetail() {
  const { homeownerId } = Route.useParams();
  const { data: homeowner, isLoading } = trpc.homeowners.get.useQuery({ id: homeownerId });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading homeowner...</div>;
  }

  if (!homeowner) {
    return <div className="p-6 text-destructive">Homeowner not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/homeowners" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{homeowner.firstName} {homeowner.lastName}</h1>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[homeowner.status])}>
              {homeowner.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-muted-foreground">Homeowner since {formatDate(homeowner.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a href={`mailto:${homeowner.email}`} className="text-sm text-primary hover:underline">
                    {homeowner.email}
                  </a>
                </div>
              </div>
              {homeowner.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={`tel:${homeowner.phone}`} className="text-sm text-primary hover:underline">
                      {formatPhoneNumber(homeowner.phone)}
                    </a>
                  </div>
                </div>
              )}
              {homeowner.mobilePhone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Mobile</p>
                    <a href={`tel:${homeowner.mobilePhone}`} className="text-sm text-primary hover:underline">
                      {formatPhoneNumber(homeowner.mobilePhone)}
                    </a>
                  </div>
                </div>
              )}
              {homeowner.currentAddress && (
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Current Address</p>
                    <p className="text-sm text-muted-foreground">{homeowner.currentAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Projects</h2>
            {homeowner.projects && homeowner.projects.length > 0 ? (
              <div className="space-y-2">
                {homeowner.projects.map((project) => (
                  <Link
                    key={project.id}
                    to="/dashboard/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.address}, {project.city}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[project.status])}>
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Recent Communications</h2>
            {homeowner.communications && homeowner.communications.length > 0 ? (
              <div className="space-y-2">
                {homeowner.communications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{comm.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comm.createdAt)}</span>
                    </div>
                    {comm.subject && <p className="text-sm">{comm.subject}</p>}
                    {comm.aiSummary && <p className="text-xs text-muted-foreground mt-1">{comm.aiSummary}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No communications yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Portal Access</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Portal Enabled</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  homeowner.portalEnabled ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                )}>
                  {homeowner.portalEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              {homeowner.portalLastLoginAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium">{formatDate(homeowner.portalLastLoginAt)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Preferences</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Preferred Contact</p>
                <p className="text-sm font-medium capitalize">{homeowner.preferredContactMethod || 'phone'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Update Frequency</p>
                <p className="text-sm font-medium capitalize">{homeowner.communicationFrequency || 'weekly'}</p>
              </div>
              {homeowner.leadSource && (
                <div>
                  <p className="text-sm text-muted-foreground">Lead Source</p>
                  <p className="text-sm font-medium capitalize">{homeowner.leadSource}</p>
                </div>
              )}
            </div>
          </div>

          {homeowner.contractSignedAt && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Contract Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Signed Date</p>
                  <p className="text-sm font-medium">{formatDate(homeowner.contractSignedAt)}</p>
                </div>
                {homeowner.contractAmount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Amount</p>
                    <p className="text-sm font-medium">{formatCurrency(homeowner.contractAmount)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {homeowner.notes && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{homeowner.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
