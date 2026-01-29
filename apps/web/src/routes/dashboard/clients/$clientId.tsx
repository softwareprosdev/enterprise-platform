import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDate, formatCurrency } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/clients/$clientId')({
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'notes'>('overview');

  const { data: client, isLoading, error } = trpc.clients.get.useQuery({ id: clientId });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      navigate({ to: '/dashboard/clients' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading client...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-muted-foreground">Client not found</div>
        <Link
          to="/dashboard/clients"
          className="text-primary hover:underline"
        >
          Back to clients
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: `Projects (${client.projects?.length ?? 0})` },
    { id: 'notes', label: 'Notes' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to clients
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {getInitials(client.companyName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.companyName}</h1>
            <p className="text-muted-foreground">{client.contactName}</p>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-2',
                statusColors[client.status] || statusColors.lead
              )}
            >
              {client.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-card-hover transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-destructive/50 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-primary hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <a
                        href={`tel:${client.phone}`}
                        className="hover:text-primary"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Industry</div>
                      <div>{client.industry}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Recent Projects</h2>
                <Link
                  to="/dashboard/projects"
                  search={{ clientId: client.id }}
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              {client.projects && client.projects.length > 0 ? (
                <div className="space-y-3">
                  {client.projects.slice(0, 3).map((project) => (
                    <Link
                      key={project.id}
                      to="/dashboard/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-card-hover transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <FolderKanban className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.budget && formatCurrency(project.budget)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          statusColors[project.status] || statusColors.draft
                        )}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Projects</span>
                  <span className="font-semibold">{client.projects?.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Projects</span>
                  <span className="font-semibold">
                    {client.projects?.filter((p) => p.status === 'in_progress').length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      client.projects?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) ?? 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="text-sm">{formatDate(client.createdAt)}</div>
                  </div>
                </div>
                {client.updatedAt && client.updatedAt !== client.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="text-sm">{formatDate(client.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-card rounded-xl border border-border">
          {client.projects && client.projects.length > 0 ? (
            <div className="divide-y divide-border">
              {client.projects.map((project) => (
                <Link
                  key={project.id}
                  to="/dashboard/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="flex items-center justify-between p-4 hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                        statusColors[project.status] || statusColors.draft
                      )}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                    {project.budget && (
                      <span className="text-sm font-medium">
                        {formatCurrency(project.budget)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create a project for this client to get started
              </p>
              <Link
                to="/dashboard/projects"
                search={{ clientId: client.id, create: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Notes</h2>
          {client.notes ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes added yet</p>
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Add notes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Client</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{client.companyName}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: clientId })}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
  status: string;
}

function EditClientModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [formData, setFormData] = useState({
    companyName: client.companyName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone || '',
    website: client.website || '',
    industry: client.industry || '',
    notes: client.notes || '',
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.get.invalidate({ id: client.id });
      utils.clients.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: client.id,
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Edit Client</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>

          {updateMutation.error && (
            <p className="text-sm text-destructive">
              {updateMutation.error.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
