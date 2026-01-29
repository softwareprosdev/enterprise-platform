import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDate, getInitials } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/clients/')({
  component: ClientsPage,
});

type ClientStatus = 'lead' | 'prospect' | 'onboarding' | 'active' | 'completed' | 'churned';

const statusOptions: { value: ClientStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Clients' },
  { value: 'lead', label: 'Leads' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'churned', label: 'Churned' },
];

function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = trpc.clients.list.useQuery({
    page,
    pageSize: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const clients = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their projects
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ClientStatus | 'all');
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first client'}
            </p>
            {!search && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Client</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Projects</div>
              <div className="col-span-2">Added</div>
            </div>

            {/* Client rows */}
            <div className="divide-y divide-border">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  to="/dashboard/clients/$clientId"
                  params={{ clientId: client.id }}
                  className="block px-6 py-4 hover:bg-card-hover transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Client info */}
                    <div className="col-span-4 flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {getInitials(client.companyName)}
                      </div>
                      <div>
                        <div className="font-medium">{client.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.contactName}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          statusColors[client.status] || statusColors.lead
                        )}
                      >
                        {client.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 space-y-1 mb-3 md:mb-0">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-32">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Projects count */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <span className="text-sm">
                        {client.projectCount ?? 0} project{(client.projectCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Added date */}
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(client.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: Show actions menu
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    notes: '',
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Add New Client</h2>
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
                placeholder="Acme Construction"
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
                placeholder="John Smith"
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
                placeholder="john@acme.com"
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
                placeholder="(555) 123-4567"
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
                placeholder="https://acme.com"
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
                placeholder="Construction"
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
                placeholder="Any additional notes about this client..."
              />
            </div>
          </div>

          {createMutation.error && (
            <p className="text-sm text-destructive">
              {createMutation.error.message}
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
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
