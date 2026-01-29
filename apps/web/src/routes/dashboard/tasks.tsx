import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckSquare,
  Building2,
  User,
  Wrench,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, formatDate, formatCurrency, statusColors } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/tasks')({
  component: TasksPage,
});

type TaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'inspection' | 'completed' | 'blocked';
type TaskPriority = 'low' | 'normal' | 'urgent' | 'critical';

function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = trpc.tasks.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });

  const tasks = data?.items ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const utils = trpc.useUtils();
  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });
  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Track inspections, subcontractors, and field deliverables.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, notes, PO numbers..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="inspection">Inspection</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <select
            className="px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Task Pipeline</h2>
          <span className="text-sm text-muted-foreground">{tasks.length} active tasks</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No tasks found.</div>
        ) : (
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-card-hover transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-5 h-5 text-[#1e3a5f]" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {task.project && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <Link to="/dashboard/projects/$projectId" params={{ projectId: task.project.id }} className="hover:text-foreground">
                            {task.project.name}
                          </Link>
                        </div>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.assignedTo.name}
                        </div>
                      )}
                      {task.trade && (
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {task.trade.name}
                        </div>
                      )}
                      {task.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.scheduledDate)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={cn('px-2 py-1 rounded-full', statusColors[task.status])}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={cn('px-2 py-1 rounded-full', statusColors[task.priority])}>
                        {task.priority}
                      </span>
                      {task.estimatedCost && (
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Est. {formatCurrency(task.estimatedCost)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="px-3 py-1.5 text-sm bg-success text-white rounded-lg hover:bg-success/90"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <select
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    >
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="inspection">Inspection</option>
                      <option value="blocked">Blocked</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => deleteMutation.mutate({ id: task.id })}
                      className="p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    tradeId: '',
    assignedToId: '',
    assignedSubcontractorId: '',
    priority: 'normal' as TaskPriority,
    scheduledDate: '',
    estimatedHours: '',
    estimatedCost: '',
    requiresInspection: false,
    poNumber: '',
  });

  const { data: projectsData } = trpc.projects.list.useQuery({ page: 1, pageSize: 200 });
  const { data: trades } = trpc.trades.list.useQuery();
  const { data: usersData } = trpc.users.list.useQuery({ page: 1, pageSize: 200 });
  const { data: subsData } = trpc.subcontractors.list.useQuery({ page: 1, pageSize: 200 });

  const projects = projectsData?.projects ?? [];
  const teamMembers = usersData?.items ?? [];
  const subcontractors = subsData?.subcontractors ?? [];

  const utils = trpc.useUtils();
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) return;
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      projectId: formData.projectId,
      tradeId: formData.tradeId || undefined,
      assignedToId: formData.assignedToId || undefined,
      assignedSubcontractorId: formData.assignedSubcontractorId || undefined,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
      estimatedHours: formData.estimatedHours || undefined,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      requiresInspection: formData.requiresInspection,
      poNumber: formData.poNumber || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Create Task</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Frame second-floor walls"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Project *</label>
            <select
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Trade</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.tradeId}
                onChange={(e) => setFormData({ ...formData, tradeId: e.target.value })}
              >
                <option value="">Select trade</option>
                {trades?.map((trade: any) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Assigned Staff</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <option value="">Select team member</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Assigned Subcontractor</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.assignedSubcontractorId}
                onChange={(e) => setFormData({ ...formData, assignedSubcontractorId: e.target.value })}
              >
                <option value="">Select subcontractor</option>
                {subcontractors.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Scheduled Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Estimated Hours</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="8"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Estimated Cost</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="2500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">PO Number</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                placeholder="PO-1024"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Include notes, materials, or inspection requirements..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.requiresInspection}
              onChange={(e) => setFormData({ ...formData, requiresInspection: e.target.checked })}
            />
            Requires inspection
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
