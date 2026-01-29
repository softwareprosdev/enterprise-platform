import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  FolderKanban,
  Zap,
  Target,
  BarChart3,
  Activity,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/analytics/')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  // Stats would come from dashboard API

  const aiInsights = [
    {
      type: 'risk',
      severity: 'high',
      title: 'Schedule Risk Detected',
      description: 'Madeira Phase 1 is trending 12 days behind schedule. Weather delays and permit issues are primary factors.',
      recommendation: 'Consider adding a second framing crew to recover lost time.',
      impact: '$45,000 potential cost overrun',
      project: 'Madeira at Brownsville',
    },
    {
      type: 'opportunity',
      severity: 'medium',
      title: 'Cash Flow Optimization',
      description: 'You have $2.4M in approved but unbilled work across 8 projects.',
      recommendation: 'Submit progress draws for Trevino and Gonzalez residences this week.',
      impact: '+$285,000 cash inflow',
    },
    {
      type: 'alert',
      severity: 'low',
      title: 'Subcontractor Performance',
      description: 'Valley Plumbing has been late on 3 of last 5 inspections.',
      recommendation: 'Schedule a performance review meeting.',
      impact: 'Prevent future delays',
    },
    {
      type: 'insight',
      severity: 'info',
      title: 'Material Cost Trend',
      description: 'Lumber prices dropped 8% this month. Good time to lock in pricing for Q2 projects.',
      recommendation: 'Contact suppliers for bulk pricing on upcoming projects.',
      impact: 'Potential $32,000 savings',
    },
  ];

  const projectHealth = [
    { name: 'Madeira at Brownsville', health: 72, status: 'at_risk', budget: 125000000, spent: 12500000 },
    { name: 'Azure Tower SPI', health: 88, status: 'on_track', budget: 85000000, spent: 18500000 },
    { name: 'Valley Medical Plaza', health: 95, status: 'ahead', budget: 65000000, spent: 28000000 },
    { name: 'Gonzalez Residence', health: 85, status: 'on_track', budget: 385000, spent: 142500 },
    { name: 'Trevino Residence', health: 91, status: 'on_track', budget: 425000, spent: 198000 },
  ];

  const kpis = [
    { label: 'Revenue YTD', value: '$12.4M', change: '+18%', trend: 'up', icon: DollarSign },
    { label: 'Gross Margin', value: '24.2%', change: '+2.1%', trend: 'up', icon: TrendingUp },
    { label: 'On-Time Delivery', value: '87%', change: '-3%', trend: 'down', icon: Clock },
    { label: 'Client Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-secondary" />
            <h1 className="text-2xl font-bold">AI Analytics</h1>
          </div>
          <p className="text-muted-foreground">Intelligent insights powered by Villa AI</p>
        </div>

        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={cn(
                'flex items-center gap-1 text-sm font-medium',
                kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
              )}>
                {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-sm text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold">AI-Powered Insights</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analysis of your projects, finances, and operations
          </p>
        </div>

        <div className="divide-y divide-border">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  insight.type === 'risk' ? 'bg-red-500/20 text-red-500' :
                  insight.type === 'opportunity' ? 'bg-green-500/20 text-green-500' :
                  insight.type === 'alert' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-blue-500/20 text-blue-500'
                )}>
                  {insight.type === 'risk' ? <AlertTriangle className="w-5 h-5" /> :
                   insight.type === 'opportunity' ? <Target className="w-5 h-5" /> :
                   insight.type === 'alert' ? <Activity className="w-5 h-5" /> :
                   <Lightbulb className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      insight.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                      insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      insight.severity === 'low' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-secondary" />
                      <span>{insight.recommendation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>{insight.impact}</span>
                    </div>
                  </div>

                  {insight.project && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {insight.project}
                    </div>
                  )}
                </div>

                <button className="btn-secondary text-sm flex items-center gap-1">
                  Take Action
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Health & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Health */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Project Health Score</h2>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {projectHealth.map((project) => (
              <div key={project.name} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{project.name}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      project.status === 'ahead' ? 'bg-green-500/20 text-green-500' :
                      project.status === 'on_track' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-red-500/20 text-red-500'
                    )}>
                      {project.status === 'ahead' ? 'Ahead' : project.status === 'on_track' ? 'On Track' : 'At Risk'}
                    </span>
                  </div>
                  <span className={cn(
                    'text-lg font-bold',
                    project.health >= 90 ? 'text-green-500' :
                    project.health >= 75 ? 'text-blue-500' :
                    'text-red-500'
                  )}>
                    {project.health}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      project.health >= 90 ? 'bg-green-500' :
                      project.health >= 75 ? 'bg-blue-500' :
                      'bg-red-500'
                    )}
                    style={{ width: `${project.health}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Budget: {formatCurrency(project.budget)}</span>
                  <span>Spent: {formatCurrency(project.spent)} ({Math.round(project.spent / project.budget * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">Financial Summary</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Cash Position */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Cash Position</span>
                <span className="text-2xl font-bold text-green-500">$2,847,320</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Expected In (30d)</span>
                  </div>
                  <span className="text-xl font-bold">+$1,245,000</span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Expected Out (30d)</span>
                  </div>
                  <span className="text-xl font-bold">-$892,500</span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div>
              <h3 className="text-sm font-medium mb-3">Revenue by Project Type</h3>
              <div className="space-y-2">
                {[
                  { type: 'Custom Homes', amount: 8500000, percent: 68 },
                  { type: 'Commercial', amount: 2800000, percent: 23 },
                  { type: 'Renovations', amount: 1100000, percent: 9 },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-muted-foreground">{item.type}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-sm font-medium">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <div className="text-sm text-muted-foreground">Avg. Project Margin</div>
                <div className="text-xl font-bold">24.2%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Outstanding Invoices</div>
                <div className="text-xl font-bold">$485,200</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Team Performance</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Maria Garcia', role: 'Sr. Project Manager', projects: 8, onTime: 94, satisfaction: 4.9 },
              { name: 'Roberto Lopez', role: 'Project Manager', projects: 6, onTime: 88, satisfaction: 4.7 },
              { name: 'Juan Hernandez', role: 'Field Superintendent', projects: 12, onTime: 91, satisfaction: 4.8 },
              { name: 'Ana Rodriguez', role: 'Office Manager', projects: 0, onTime: 0, satisfaction: 4.9 },
            ].map((member) => (
              <div key={member.name} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                {member.projects > 0 && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Projects</span>
                      <span className="font-medium">{member.projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">On-Time Rate</span>
                      <span className={cn('font-medium', member.onTime >= 90 ? 'text-green-500' : 'text-yellow-500')}>
                        {member.onTime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Rating</span>
                      <span className="font-medium">{member.satisfaction}/5</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
