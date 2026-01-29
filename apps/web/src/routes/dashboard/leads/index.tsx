import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Building2,
  Star,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/leads/')({
  component: LeadsPage,
});

const STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-yellow-500' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500' },
];

const DEMO_LEADS = [
  {
    id: '1',
    contactName: 'Michael Thompson',
    companyName: 'Thompson Investments',
    email: 'michael@thompsoninv.com',
    phone: '(956) 555-1234',
    source: 'referral',
    stage: 'qualified',
    estimatedValue: 485000,
    probability: 75,
    aiScore: 87,
    projectType: 'Custom Home - Luxury',
    projectLocation: 'Sharyland Plantation, Mission',
    nextFollowUp: new Date('2025-01-30'),
    lastContactAt: new Date('2025-01-27'),
    assignedTo: 'Maria Garcia',
  },
  {
    id: '2',
    contactName: 'Jennifer Rodriguez',
    email: 'jrodriguez@gmail.com',
    phone: '(956) 555-2345',
    source: 'website',
    stage: 'new',
    estimatedValue: 350000,
    probability: 40,
    aiScore: 62,
    projectType: 'Custom Home - Standard',
    projectLocation: 'Tres Lagos, McAllen',
    nextFollowUp: new Date('2025-01-29'),
    assignedTo: 'Carlos Martinez',
  },
  {
    id: '3',
    contactName: 'David Chen',
    companyName: 'Chen Development Group',
    email: 'david@chendev.com',
    phone: '(956) 555-3456',
    source: 'showroom',
    stage: 'proposal_sent',
    estimatedValue: 1250000,
    probability: 60,
    aiScore: 78,
    projectType: 'Multi-Family Residential',
    projectLocation: 'Downtown Brownsville',
    nextFollowUp: new Date('2025-02-01'),
    lastContactAt: new Date('2025-01-28'),
    assignedTo: 'Maria Garcia',
  },
  {
    id: '4',
    contactName: 'Sarah Williams',
    email: 'sarah.w@outlook.com',
    phone: '(956) 555-4567',
    source: 'facebook_ads',
    stage: 'contacted',
    estimatedValue: 425000,
    probability: 55,
    aiScore: 71,
    projectType: 'Pool Home - Premium',
    projectLocation: 'Palm Valley, McAllen',
    nextFollowUp: new Date('2025-01-31'),
    lastContactAt: new Date('2025-01-26'),
    assignedTo: 'Roberto Lopez',
  },
  {
    id: '5',
    contactName: 'Robert Garcia',
    email: 'rgarcia@business.com',
    phone: '(956) 555-5678',
    source: 'google_ads',
    stage: 'negotiation',
    estimatedValue: 675000,
    probability: 80,
    aiScore: 92,
    projectType: 'Custom Home - Executive',
    projectLocation: 'Cimarron Country, Mission',
    nextFollowUp: new Date('2025-01-29'),
    lastContactAt: new Date('2025-01-28'),
    assignedTo: 'Carlos Martinez',
  },
];

function LeadsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLeads = DEMO_LEADS.filter(
    (lead) =>
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadsByStage = (stageId: string) =>
    filteredLeads.filter((lead) => lead.stage === stageId);

  const totalPipelineValue = filteredLeads.reduce(
    (sum, lead) => sum + (lead.estimatedValue || 0),
    0
  );

  const weightedPipelineValue = filteredLeads.reduce(
    (sum, lead) => sum + ((lead.estimatedValue || 0) * (lead.probability || 0)) / 100,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lead Pipeline</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} leads • {formatCurrency(totalPipelineValue)} total pipeline
          </p>
        </div>
        <button
          onClick={() => console.log('Add lead modal')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredLeads.length}</div>
              <div className="text-sm text-muted-foreground">Active Leads</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
              <div className="text-sm text-muted-foreground">Pipeline Value</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(weightedPipelineValue)}</div>
              <div className="text-sm text-muted-foreground">Weighted Value</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {filteredLeads.filter((l) => l.aiScore >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Hot Leads (AI)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'kanban' ? 'bg-card shadow' : 'text-muted-foreground'
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'list' ? 'bg-card shadow' : 'text-muted-foreground'
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.slice(0, 6).map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(stageValue)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Lead</th>
                <th className="text-left p-4 text-sm font-medium">Source</th>
                <th className="text-left p-4 text-sm font-medium">Stage</th>
                <th className="text-left p-4 text-sm font-medium">Value</th>
                <th className="text-left p-4 text-sm font-medium">AI Score</th>
                <th className="text-left p-4 text-sm font-medium">Next Follow-up</th>
                <th className="text-left p-4 text-sm font-medium">Assigned</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                        {lead.contactName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{lead.contactName}</div>
                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-sm">{lead.source?.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        STAGES.find((s) => s.id === lead.stage)?.color,
                        'text-white'
                      )}
                    >
                      {lead.stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{formatCurrency(lead.estimatedValue || 0)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                          lead.aiScore >= 80
                            ? 'bg-green-500/20 text-green-500'
                            : lead.aiScore >= 60
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                        )}
                      >
                        {lead.aiScore}
                      </div>
                      {lead.aiScore >= 80 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {lead.nextFollowUp && formatDate(lead.nextFollowUp)}
                  </td>
                  <td className="p-4 text-sm">{lead.assignedTo}</td>
                  <td className="p-4">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: (typeof DEMO_LEADS)[0] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {lead.contactName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-sm">{lead.contactName}</div>
            {lead.companyName && (
              <div className="text-xs text-muted-foreground">{lead.companyName}</div>
            )}
          </div>
        </div>
        {lead.aiScore >= 80 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
            <Zap className="w-3 h-3" />
            Hot
          </div>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{formatCurrency(lead.estimatedValue || 0)}</span>
          <span className="text-muted-foreground">• {lead.probability}%</span>
        </div>
        {lead.projectType && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            {lead.projectType}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {lead.nextFollowUp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(lead.nextFollowUp)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Phone className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Mail className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
