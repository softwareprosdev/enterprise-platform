import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  FolderKanban,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  HardHat,
  AlertTriangle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDate, formatCurrency, getInitials, phaseLabels } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/projects/')({
  component: ProjectsPage,
});

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type ProjectPhase =
  | 'pre_construction'
  | 'site_prep'
  | 'foundation'
  | 'framing'
  | 'roofing'
  | 'rough_in'
  | 'insulation'
  | 'drywall'
  | 'interior_finish'
  | 'exterior_finish'
  | 'final_completion'
  | 'warranty_period'
  | 'archived';

type ViewMode = 'grid' | 'list' | 'kanban';

const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const phaseOptions: { value: ProjectPhase | 'all'; label: string }[] = [
  { value: 'all', label: 'All Phases' },
  { value: 'pre_construction', label: 'Pre-Construction' },
  { value: 'site_prep', label: 'Site Prep' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'framing', label: 'Framing' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'rough_in', label: 'Rough-In' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'interior_finish', label: 'Interior Finish' },
  { value: 'exterior_finish', label: 'Exterior Finish' },
  { value: 'final_completion', label: 'Final Completion' },
  { value: 'warranty_period', label: 'Warranty Period' },
];

const kanbanColumns: { status: ProjectStatus; label: string; color: string }[] = [
  { status: 'planning', label: 'Planning', color: 'border-[#1e3a5f]' },
  { status: 'active', label: 'Active', color: 'border-[#e85d04]' },
  { status: 'completed', label: 'Completed', color: 'border-green-500' },
  { status: 'on_hold', label: 'On Hold', color: 'border-yellow-500' },
];

function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = trpc.projects.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    phase: phaseFilter === 'all' ? undefined : phaseFilter,
  });

  const projects = data?.projects ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const projectsAtRisk = data?.projectsAtRisk ?? 0;

  // Group projects by status for kanban view
  const projectsByStatus = kanbanColumns.reduce((acc, col) => {
    acc[col.status] = projects.filter((p) => p.status === col.status);
    return acc;
  }, {} as Record<ProjectStatus, typeof projects>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage custom home builds and track construction progress
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Risk alert */}
      {projectsAtRisk > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <span className="font-medium text-red-500">{projectsAtRisk} project{projectsAtRisk !== 1 ? 's' : ''}</span>
            <span className="text-muted-foreground ml-2">with detected risks</span>
          </div>
          <button className="text-sm text-red-500 hover:text-red-600 font-medium">
            View details
          </button>
        </div>
      )}

      {/* Filters and view toggle */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by name, address, or homeowner..."
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
              setStatusFilter(e.target.value as ProjectStatus | 'all');
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

        {/* Phase filter */}
        <div className="relative">
          <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={phaseFilter}
            onChange={(e) => {
              setPhaseFilter(e.target.value as ProjectPhase | 'all');
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          >
            {phaseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-card-hover'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'list' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-card-hover'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'kanban' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-card-hover'
            )}
            title="Kanban view"
          >
            <FolderKanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search || statusFilter !== 'all' || phaseFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first custom home project'}
          </p>
          {!search && statusFilter === 'all' && phaseFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        // Kanban view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[500px]">
          {kanbanColumns.map((column) => (
            <div key={column.status} className="flex flex-col">
              <div className={cn('border-t-4 rounded-t-lg pt-3 pb-2 px-3 bg-card', column.color)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {projectsByStatus[column.status]?.length ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-muted/30 rounded-b-lg p-2 space-y-2">
                {projectsByStatus[column.status]?.map((project) => (
                  <Link
                    key={project.id}
                    to="/dashboard/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="block bg-card rounded-lg border border-border p-3 hover:border-[#1e3a5f]/50 transition-colors"
                  >
                    <div className="font-medium text-sm mb-2">{project.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.address}, {project.city}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      {project.homeowner && (
                        <div className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {project.homeowner.firstName} {project.homeowner.lastName}
                        </div>
                      )}
                      {project.currentPhase && (
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs',
                          statusColors[project.currentPhase]
                        )}>
                          {phaseLabels[project.currentPhase] || project.currentPhase}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/dashboard/projects/$projectId"
              params={{ projectId: project.id }}
              className="bg-card rounded-xl border border-border p-5 hover:border-[#1e3a5f]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <div className="flex items-center gap-2">
                  {project.hasRisk && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                      statusColors[project.status] || statusColors.planning
                    )}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {project.address}
              </p>
              {project.homeowner && (
                <p className="text-sm text-muted-foreground mb-3">
                  {project.homeowner.firstName} {project.homeowner.lastName}
                </p>
              )}

              {/* Phase indicator */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Phase</span>
                  <span className="font-medium">
                    {project.currentPhase ? (phaseLabels[project.currentPhase] || project.currentPhase) : 'Not started'}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      project.currentPhase ? (statusColors[project.currentPhase] || 'bg-muted') : 'bg-muted'
                    )}
                    style={{
                      width: project.phaseProgress ? `${project.phaseProgress}%` : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.contractAmount && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(project.contractAmount)}
                  </div>
                )}
                {project.estimatedCompletionDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.estimatedCompletionDate)}
                  </div>
                )}
              </div>

              {/* Financial summary */}
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                  <div className="text-sm font-medium">
                    {project.budgetTotal ? formatCurrency(project.budgetTotal) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Spent</div>
                  <div className="text-sm font-medium">
                    {project.totalSpent ? formatCurrency(project.totalSpent) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className={cn(
                    'text-sm font-medium',
                    project.remainingBudget && project.remainingBudget < 0 ? 'text-red-500' : ''
                  )}>
                    {project.remainingBudget !== undefined
                      ? formatCurrency(project.remainingBudget)
                      : '-'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // List view
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Project</div>
            <div className="col-span-2">Homeowner</div>
            <div className="col-span-2">Phase</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-2">Timeline</div>
            <div className="col-span-1">Status</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/dashboard/projects/$projectId"
                params={{ projectId: project.id }}
                className="block px-6 py-4 hover:bg-card-hover transition-colors"
              >
                <div className="md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Project info */}
                  <div className="col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-32">{project.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Homeowner */}
                  <div className="col-span-2 mb-3 md:mb-0">
                    {project.homeowner ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] text-xs font-medium">
                          {getInitials(`${project.homeowner.firstName} ${project.homeowner.lastName}`)}
                        </div>
                        <span className="text-sm truncate">
                          {project.homeowner.firstName} {project.homeowner.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No homeowner</span>
                    )}
                  </div>

                  {/* Phase */}
                  <div className="col-span-2 mb-3 md:mb-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        project.currentPhase ? (statusColors[project.currentPhase] || statusColors.pre_construction) : statusColors.pre_construction
                      )}
                    >
                      {project.currentPhase ? (phaseLabels[project.currentPhase] || project.currentPhase) : 'Planning'}
                    </span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {project.phaseProgress ? `${project.phaseProgress}%` : '0%'} complete
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="col-span-2 mb-3 md:mb-0">
                    <span className="text-sm font-medium">
                      {project.contractAmount ? formatCurrency(project.contractAmount) : '-'}
                    </span>
                    {project.budgetTotal && (
                      <div className="text-xs text-muted-foreground">
                        Budget: {formatCurrency(project.budgetTotal)}
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="col-span-2 mb-3 md:mb-0">
                    <span className="text-sm text-muted-foreground">
                      {project.estimatedCompletionDate
                        ? formatDate(project.estimatedCompletionDate)
                        : 'No end date'}
                    </span>
                    {project.daysRemaining !== undefined && (
                      <div className={cn(
                        'text-xs',
                        project.daysRemaining < 0 ? 'text-red-500' : 'text-muted-foreground'
                      )}>
                        {project.daysRemaining < 0
                          ? `${Math.abs(project.daysRemaining)} days overdue`
                          : `${project.daysRemaining} days remaining`}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center gap-2">
                    {project.hasRisk && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        statusColors[project.status] || statusColors.planning
                      )}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination (not for kanban) */}
      {viewMode !== 'kanban' && totalPages > 1 && (
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

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddProjectModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    projectNumber: '',
    description: '',
    homeownerId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contractAmount: '',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    stories: '',
    garageSpaces: '',
  });

  const { data: homeownersData } = trpc.homeowners.list.useQuery({
    page: 1,
    pageSize: 100,
    status: 'contracted',
  });
  const homeowners = homeownersData?.homeowners ?? [];

  const utils = trpc.useUtils();
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      projectNumber: formData.projectNumber || undefined,
      description: formData.description || undefined,
      homeownerId: formData.homeownerId || undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      contractAmount: formData.contractAmount ? parseFloat(formData.contractAmount) : undefined,
      estimatedStartDate: formData.estimatedStartDate ? new Date(formData.estimatedStartDate) : undefined,
      estimatedCompletionDate: formData.estimatedCompletionDate ? new Date(formData.estimatedCompletionDate) : undefined,
      squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : undefined,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
      stories: formData.stories ? parseInt(formData.stories) : undefined,
      garageSpaces: formData.garageSpaces ? parseInt(formData.garageSpaces) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="Johnson Residence"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Project Number
              </label>
              <input
                type="text"
                value={formData.projectNumber}
                onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="VH-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Homeowner *</label>
              <select
                required
                value={formData.homeownerId}
                onChange={(e) => setFormData({ ...formData, homeownerId: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              >
                <option value="">Select a homeowner...</option>
                {homeowners.map((homeowner) => (
                  <option key={homeowner.id} value={homeowner.id}>
                    {homeowner.firstName} {homeowner.lastName} ({homeowner.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Property Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">ZIP *</label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              />
            </div>
          </div>

          {/* Contract Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Contract Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Square Footage</label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="3500"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Estimated Start Date</label>
              <input
                type="date"
                value={formData.estimatedStartDate}
                onChange={(e) => setFormData({ ...formData, estimatedStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Estimated Completion</label>
              <input
                type="date"
                value={formData.estimatedCompletionDate}
                onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
              />
            </div>
          </div>

          {/* Home Specs */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Stories</label>
              <input
                type="number"
                value={formData.stories}
                onChange={(e) => setFormData({ ...formData, stories: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Garage</label>
              <input
                type="number"
                value={formData.garageSpaces}
                onChange={(e) => setFormData({ ...formData, garageSpaces: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                placeholder="2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50 resize-none"
              placeholder="Project details, special features, notes..."
            />
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
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
