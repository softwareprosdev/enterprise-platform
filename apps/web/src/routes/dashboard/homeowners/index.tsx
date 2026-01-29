import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Mail,
  Phone,
  Home,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDate, getInitials, homeownerStatusLabels, formatPhoneNumber } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/homeowners/')({
  component: HomeownersPage,
});

type HomeownerStatus = 'inquiry' | 'contracted' | 'construction' | 'punch_list' | 'completed' | 'warranty' | 'archived';

const statusOptions: { value: HomeownerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Homeowners' },
  { value: 'inquiry', label: 'Inquiries' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'construction', label: 'Under Construction' },
  { value: 'punch_list', label: 'Punch List' },
  { value: 'completed', label: 'Completed' },
  { value: 'warranty', label: 'Warranty Period' },
  { value: 'archived', label: 'Archived' },
];

function HomeownersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HomeownerStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = trpc.homeowners.list.useQuery({
    page,
    pageSize: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const homeowners = data?.homeowners ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Homeowners</h1>
          <p className="text-muted-foreground">
            Manage your homeowners and their custom home projects
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Homeowner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search homeowners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as HomeownerStatus | 'all');
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homeowners list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading homeowners...
          </div>
        ) : homeowners.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No homeowners found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first homeowner'}
            </p>
            {!search && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Homeowner
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-3">Homeowner</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Projects</div>
              <div className="col-span-2">Contract Date</div>
            </div>

            {/* Homeowner rows */}
            <div className="divide-y divide-border">
              {homeowners.map((homeowner) => (
                <Link
                  key={homeowner.id}
                  to="/dashboard/homeowners/$homeownerId"
                  params={{ homeownerId: homeowner.id }}
                  className="block px-6 py-4 hover:bg-card-hover transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Homeowner info */}
                    <div className="col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-semibold">
                        {getInitials(`${homeowner.firstName} ${homeowner.lastName}`)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {homeowner.firstName} {homeowner.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {homeowner.leadSource ? `Via ${homeowner.leadSource}` : 'Direct inquiry'}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusColors[homeowner.status] || statusColors.inquiry
                        )}
                      >
                        {homeownerStatusLabels[homeowner.status] || homeowner.status}
                      </span>
                    </div>

                    {/* Contact */}
                    <div className="col-span-3 space-y-1 mb-3 md:mb-0">
                      {homeowner.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-40">{homeowner.email}</span>
                        </div>
                      )}
                      {homeowner.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{formatPhoneNumber(homeowner.phone)}</span>
                        </div>
                      )}
                      {homeowner.mobilePhone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span className="text-xs">Mobile: {formatPhoneNumber(homeowner.mobilePhone)}</span>
                        </div>
                      )}
                    </div>

                    {/* Projects count */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {homeowner.projectCount ?? 0} project{(homeowner.projectCount ?? 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {homeowner.contractAmount && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Contract: ${homeowner.contractAmount}
                        </div>
                      )}
                    </div>

                    {/* Contract date */}
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="text-sm">
                        {homeowner.contractSignedAt ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(homeowner.contractSignedAt)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No contract yet</span>
                        )}
                      </div>
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

      {/* Add Homeowner Modal */}
      {showAddModal && (
        <AddHomeownerModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddHomeownerModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobilePhone: '',
    currentAddress: '',
    leadSource: '',
    notes: '',
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.homeowners.create.useMutation({
    onSuccess: () => {
      utils.homeowners.list.invalidate();
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
          <h2 className="text-lg font-semibold">Add New Homeowner</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="Smith"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="john@email.com"
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mobile Phone</label>
              <input
                type="tel"
                value={formData.mobilePhone}
                onChange={(e) =>
                  setFormData({ ...formData, mobilePhone: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="(555) 987-6543"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Current Address</label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) =>
                  setFormData({ ...formData, currentAddress: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="123 Current St, City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Lead Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) =>
                  setFormData({ ...formData, leadSource: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              >
                <option value="">Select source...</option>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="showroom">Showroom</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
                <option value="walk_in">Walk-in</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50 resize-none"
                placeholder="Any notes about this homeowner..."
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
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Add Homeowner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
