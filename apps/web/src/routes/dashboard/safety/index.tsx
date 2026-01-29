import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Camera,
  HardHat,
  Eye,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/safety/')({
  component: SafetyPage,
});

const DEMO_VIOLATIONS = [
  {
    id: '1',
    type: 'missing_ppe',
    description: 'Worker without hard hat in framing area',
    severity: 'high',
    projectName: 'Gonzalez Residence',
    location: 'Second floor framing',
    aiDetected: true,
    aiConfidence: 0.94,
    photoUrl: '/safety/violation-1.jpg',
    reportedAt: new Date('2025-01-29T09:15:00'),
    status: 'open',
  },
  {
    id: '2',
    type: 'fall_hazard',
    description: 'Unprotected roof edge without guardrails',
    severity: 'critical',
    projectName: 'Trevino Residence',
    location: 'Roof perimeter',
    aiDetected: true,
    aiConfidence: 0.89,
    photoUrl: '/safety/violation-2.jpg',
    reportedAt: new Date('2025-01-28T14:30:00'),
    status: 'resolved',
    resolvedAt: new Date('2025-01-28T15:45:00'),
  },
  {
    id: '3',
    type: 'housekeeping',
    description: 'Debris blocking emergency exit path',
    severity: 'medium',
    projectName: 'Valley Medical Plaza',
    location: 'Ground floor east wing',
    aiDetected: false,
    reportedBy: 'Antonio Vargas',
    reportedAt: new Date('2025-01-28T11:00:00'),
    status: 'in_progress',
  },
  {
    id: '4',
    type: 'electrical_hazard',
    description: 'Exposed wiring near water source',
    severity: 'critical',
    projectName: 'Madeira at Brownsville',
    location: 'Clubhouse bathroom',
    aiDetected: true,
    aiConfidence: 0.91,
    reportedAt: new Date('2025-01-27T16:20:00'),
    status: 'resolved',
    resolvedAt: new Date('2025-01-27T17:00:00'),
  },
];

const DEMO_MEETINGS = [
  {
    id: '1',
    topic: 'Weekly Safety Toolbox Talk',
    projectName: 'All Projects',
    date: new Date('2025-01-29T07:00:00'),
    attendees: 12,
    conductedBy: 'Juan Hernandez',
  },
  {
    id: '2',
    topic: 'Fall Protection Training',
    projectName: 'Azure Tower',
    date: new Date('2025-01-28T07:30:00'),
    attendees: 8,
    conductedBy: 'Roberto Gonzalez',
  },
  {
    id: '3',
    topic: 'PPE Requirements Review',
    projectName: 'Madeira at Brownsville',
    date: new Date('2025-01-27T07:00:00'),
    attendees: 15,
    conductedBy: 'Antonio Vargas',
  },
];

const VIOLATION_TYPES = {
  missing_ppe: { label: 'Missing PPE', icon: HardHat, color: 'text-yellow-500' },
  fall_hazard: { label: 'Fall Hazard', icon: AlertTriangle, color: 'text-red-500' },
  electrical_hazard: { label: 'Electrical Hazard', icon: AlertTriangle, color: 'text-orange-500' },
  housekeeping: { label: 'Housekeeping', icon: Eye, color: 'text-blue-500' },
  equipment_misuse: { label: 'Equipment Misuse', icon: AlertTriangle, color: 'text-purple-500' },
};

const SEVERITY_CONFIG = {
  low: { label: 'Low', color: 'bg-blue-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-500' },
};

function SafetyPage() {
  const [selectedViolation, setSelectedViolation] = useState<typeof DEMO_VIOLATIONS[0] | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredViolations = DEMO_VIOLATIONS.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'open') return v.status !== 'resolved';
    return v.status === 'resolved';
  });

  const stats = {
    openViolations: DEMO_VIOLATIONS.filter((v) => v.status !== 'resolved').length,
    resolvedThisWeek: DEMO_VIOLATIONS.filter((v) => v.status === 'resolved').length,
    aiDetected: DEMO_VIOLATIONS.filter((v) => v.aiDetected).length,
    daysWithoutIncident: 47,
    meetingsThisMonth: DEMO_MEETINGS.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Smart Safety Compliance
          </h1>
          <p className="text-muted-foreground">AI-powered safety monitoring and OSHA compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            OSHA Reports
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Report Violation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.openViolations}</div>
              <div className="text-sm text-muted-foreground">Open Violations</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.resolvedThisWeek}</div>
              <div className="text-sm text-muted-foreground">Resolved This Week</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.aiDetected}</div>
              <div className="text-sm text-muted-foreground">AI Detected</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.daysWithoutIncident}</div>
              <div className="text-sm text-muted-foreground">Days Without Incident</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.meetingsThisMonth}</div>
              <div className="text-sm text-muted-foreground">Safety Meetings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Violations List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Safety Violations</h2>
          </div>
          <div className="divide-y divide-border">
            {filteredViolations.map((violation) => {
              const TypeConfig = VIOLATION_TYPES[violation.type as keyof typeof VIOLATION_TYPES];
              const TypeIcon = TypeConfig?.icon || AlertTriangle;
              return (
                <div
                  key={violation.id}
                  onClick={() => setSelectedViolation(violation)}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    selectedViolation?.id === violation.id && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-0.5', TypeConfig?.color)}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{violation.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {violation.projectName} • {violation.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                        SEVERITY_CONFIG[violation.severity as keyof typeof SEVERITY_CONFIG]?.color
                      )}>
                        {SEVERITY_CONFIG[violation.severity as keyof typeof SEVERITY_CONFIG]?.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {violation.aiDetected && (
                      <div className="flex items-center gap-1 text-secondary">
                        <Sparkles className="w-3 h-3" />
                        AI Detected ({Math.round((violation.aiConfidence || 0) * 100)}%)
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(violation.reportedAt)}
                    </div>
                    {violation.status === 'resolved' ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </div>
                    ) : violation.status === 'in_progress' ? (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="w-3 h-3" />
                        Open
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Detection Preview */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                AI Safety Analysis
              </h3>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <Camera className="w-12 h-12 text-muted-foreground/30" />
                {/* AI detection overlay example */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Missing Hard Hat Detected
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                AI analyzes site photos in real-time to detect safety violations including missing PPE, 
                fall hazards, and housekeeping issues.
              </p>
            </div>
          </div>

          {/* Recent Safety Meetings */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Safety Meetings</h3>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            <div className="divide-y divide-border">
              {DEMO_MEETINGS.map((meeting) => (
                <div key={meeting.id} className="p-4">
                  <div className="font-medium text-sm">{meeting.topic}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {meeting.projectName} • {formatDate(meeting.date)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {meeting.attendees} attendees
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
