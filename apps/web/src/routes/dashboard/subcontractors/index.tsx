import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  HardHat,
  Mail,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Calendar,
  Wrench,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDate, getInitials, tradeLabels } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/subcontractors/')({
  component: SubcontractorsPage,
});

type SubcontractorStatus = 'preferred' | 'active' | 'on_hold' | 'do_not_use';

const statusOptions: { value: SubcontractorStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Subcontractors' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'do_not_use', label: 'Do Not Use' },
];

const tradeOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Trades' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'framing', label: 'Framing' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'painting', label: 'Painting' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'cabinets', label: 'Cabinets' },
];

function SubcontractorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubcontractorStatus | 'all'>('all');
  const [tradeFilter, setTradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = trpc.subcontractors.list.useQuery({
    page,
    pageSize: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    trade: tradeFilter || undefined,
  });

  const subcontractors = data?.subcontractors ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subcontractors</h1>
          <p className="text-muted-foreground">
            Manage your trade partners and vendor relationships
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subcontractor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subcontractors..."
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
              setStatusFilter(e.target.value as SubcontractorStatus | 'all');
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

        {/* Trade filter */}
        <div className="relative">
          <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={tradeFilter}
            onChange={(e) => {
              setTradeFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          >
            {tradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subcontractors list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading subcontractors...
          </div>
        ) : subcontractors.length === 0 ? (
          <div className="p-8 text-center">
            <HardHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No subcontractors found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search || statusFilter !== 'all' || tradeFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first subcontractor'}
            </p>
            {!search && statusFilter === 'all' && !tradeFilter && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Subcontractor
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Primary Trade</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Performance</div>
              <div className="col-span-2">Insurance</div>
              <div className="col-span-1"></div>
            </div>

            {/* Subcontractor rows */}
            <div className="divide-y divide-border">
              {subcontractors.map((sub) => (
                <div
                  key={sub.id}
                  className="block px-6 py-4 hover:bg-card-hover transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Company info */}
                    <div className="col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-semibold">
                        {getInitials(sub.companyName)}
                      </div>
                      <div>
                        <div className="font-medium">{sub.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {sub.contactName}
                        </div>
                      </div>
                    </div>

                    {/* Primary Trade */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Trade Info
                        </span>
                      </div>
                      {sub.licenseNumber && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Lic: {sub.licenseNumber}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          statusColors[sub.status] || statusColors.active
                        )}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                      {sub.totalProjectsCompleted !== null && sub.totalProjectsCompleted > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {sub.totalProjectsCompleted} projects completed
                        </div>
                      )}
                    </div>

                    {/* Performance */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <div className="flex items-center gap-2">
                        {sub.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{sub.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No rating</span>
                        )}
                      </div>
                      {sub.onTimePercentage !== null && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {sub.onTimePercentage}% on time
                        </div>
                      )}
                    </div>

                    {/* Insurance */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      {sub.insuranceExpiry ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className={cn(
                            'text-sm',
                            new Date(sub.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                          )}>
                            Expires {formatDate(sub.insuranceExpiry)}
                          </span>
                          {new Date(sub.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No insurance info</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      {sub.contactEmail && (
                        <a
                          href={`mailto:${sub.contactEmail}`}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {sub.contactPhone && (
                        <a
                          href={`tel:${sub.contactPhone}`}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Add Subcontractor Modal */}
      {showAddModal && (
        <AddSubcontractorModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddSubcontractorModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactMobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    primaryTradeId: '',
    licenseNumber: '',
    insuranceCarrier: '',
    insurancePolicyNumber: '',
    insuranceCoverageAmount: '',
    notes: '',
  });

  const { data: trades } = trpc.trades.list.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.subcontractors.create.useMutation({
    onSuccess: () => {
      utils.subcontractors.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      insuranceCoverageAmount: formData.insuranceCoverageAmount
        ? parseFloat(formData.insuranceCoverageAmount)
        : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Add New Subcontractor</h2>
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="ABC Construction Co."
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="john@abcconstruction.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Primary Trade</label>
              <select
                value={formData.primaryTradeId}
                onChange={(e) =>
                  setFormData({ ...formData, primaryTradeId: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              >
                <option value="">Select a trade...</option>
                {trades?.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {tradeLabels[trade.category] || trade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="ABC-123456"
              />
            </div>

            <div className="col-span-2">
              <h3 className="font-medium text-sm mt-4 mb-2">Insurance Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Carrier</label>
              <input
                type="text"
                value={formData.insuranceCarrier}
                onChange={(e) =>
                  setFormData({ ...formData, insuranceCarrier: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="ABC Insurance Co."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Policy Number</label>
              <input
                type="text"
                value={formData.insurancePolicyNumber}
                onChange={(e) =>
                  setFormData({ ...formData, insurancePolicyNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="POL-123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Coverage Amount</label>
              <input
                type="number"
                value={formData.insuranceCoverageAmount}
                onChange={(e) =>
                  setFormData({ ...formData, insuranceCoverageAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="1000000"
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50 resize-none"
                placeholder="Any notes about this subcontractor..."
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
              {createMutation.isPending ? 'Creating...' : 'Add Subcontractor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
