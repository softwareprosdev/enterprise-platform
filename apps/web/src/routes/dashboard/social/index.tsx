import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Share2,
  Facebook,
  Instagram,
  MessageCircle,
  Image,
  Video,
  Calendar,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  DollarSign,
  Plus,
  Settings,
  BarChart3,
  Send,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/social/')({
  component: SocialMediaPage,
});

const DEMO_ACCOUNTS = [
  {
    id: '1',
    platform: 'facebook',
    accountName: 'Villa Homes RGV',
    followers: 12450,
    isConnected: true,
  },
  {
    id: '2',
    platform: 'instagram',
    accountName: '@villahomesrgv',
    followers: 8920,
    isConnected: true,
  },
  {
    id: '3',
    platform: 'whatsapp',
    accountName: 'Villa Homes Business',
    isConnected: true,
  },
];

const DEMO_POSTS = [
  {
    id: '1',
    platform: 'instagram',
    content: '🏠 Another beautiful custom home completed in Sharyland Plantation! This 4,200 sq ft masterpiece features a gourmet kitchen, infinity pool, and stunning valley views. #VillaHomes #CustomHomes #RGV',
    mediaType: 'image',
    status: 'published',
    publishedAt: new Date('2025-01-28T14:00:00'),
    projectName: 'Gonzalez Residence',
    engagement: { likes: 234, comments: 18, shares: 12, reach: 4520 },
  },
  {
    id: '2',
    platform: 'facebook',
    content: '🎉 Exciting progress at Madeira at Brownsville! Phase 1 infrastructure is 23% complete. This master-planned community will feature 850 luxury homes, a championship golf course, and resort-style amenities.',
    mediaType: 'carousel',
    status: 'published',
    publishedAt: new Date('2025-01-27T10:00:00'),
    projectName: 'Madeira at Brownsville',
    engagement: { likes: 456, comments: 42, shares: 28, reach: 8900 },
  },
  {
    id: '3',
    platform: 'instagram',
    content: '✨ Sneak peek of the Azure Tower penthouse level! Floor-to-ceiling windows with unobstructed Gulf views. Pre-sales starting soon!',
    mediaType: 'video',
    status: 'scheduled',
    scheduledAt: new Date('2025-01-30T12:00:00'),
    projectName: 'Azure Tower',
  },
  {
    id: '4',
    platform: 'facebook',
    content: 'Meet our team! Juan Hernandez, Field Superintendent, has been with Villa Homes for 8 years. His attention to detail and dedication to quality is what makes our homes exceptional.',
    mediaType: 'image',
    status: 'draft',
    projectName: 'Company Culture',
  },
];

const DEMO_CAMPAIGNS = [
  {
    id: '1',
    name: 'Madeira Pre-Launch',
    platform: 'facebook',
    objective: 'leads',
    status: 'active',
    budget: 5000,
    spent: 2340,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-15'),
    metrics: { impressions: 125000, clicks: 3200, leads: 47, costPerLead: 49.79 },
  },
  {
    id: '2',
    name: 'Custom Homes Awareness',
    platform: 'instagram',
    objective: 'awareness',
    status: 'active',
    budget: 2500,
    spent: 890,
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-20'),
    metrics: { impressions: 89000, clicks: 1800, reach: 45000 },
  },
];

const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: 'bg-blue-600', name: 'Facebook' },
  instagram: { icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500', name: 'Instagram' },
  whatsapp: { icon: MessageCircle, color: 'bg-green-500', name: 'WhatsApp' },
};

function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'campaigns' | 'analytics'>('posts');

  const totalReach = DEMO_POSTS.filter(p => p.engagement).reduce((sum, p) => sum + (p.engagement?.reach || 0), 0);
  const totalEngagement = DEMO_POSTS.filter(p => p.engagement).reduce((sum, p) => 
    sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0), 0);
  const totalLeads = DEMO_CAMPAIGNS.reduce((sum, c) => sum + (c.metrics?.leads || 0), 0);
  const totalAdSpend = DEMO_CAMPAIGNS.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Social Media Hub
          </h1>
          <p className="text-muted-foreground">Manage your social presence and advertising</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Accounts
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {DEMO_ACCOUNTS.map((account) => {
          const PlatformIcon = PLATFORM_CONFIG[account.platform as keyof typeof PLATFORM_CONFIG]?.icon;
          return (
            <div key={account.id} className="flex-shrink-0 bg-card rounded-xl border border-border p-4 min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                  PLATFORM_CONFIG[account.platform as keyof typeof PLATFORM_CONFIG]?.color
                )}>
                  {PlatformIcon && <PlatformIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium text-sm">{account.accountName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{account.platform}</div>
                </div>
              </div>
              {account.followers && (
                <div className="text-sm">
                  <span className="font-bold">{account.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground"> followers</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </div>
            </div>
          );
        })}
        <button className="flex-shrink-0 bg-muted/50 rounded-xl border border-dashed border-border p-4 min-w-[200px] flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted transition-colors">
          <Plus className="w-5 h-5" />
          Connect Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalReach.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Reach</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Engagements</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <div className="text-sm text-muted-foreground">Leads from Ads</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalAdSpend)}</div>
              <div className="text-sm text-muted-foreground">Ad Spend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {(['posts', 'campaigns', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DEMO_POSTS.map((post) => {
            const PlatformIcon = PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG]?.icon;
            return (
              <div key={post.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-white',
                      PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG]?.color
                    )}>
                      {PlatformIcon && <PlatformIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">{post.platform}</div>
                      <div className="text-xs text-muted-foreground">{post.projectName}</div>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                    post.status === 'published' ? 'bg-green-500/20 text-green-500' :
                    post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {post.status}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-sm mb-3">{post.content}</p>
                  
                  {/* Media placeholder */}
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {post.mediaType === 'video' ? (
                      <Video className="w-8 h-8 text-muted-foreground/50" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Engagement stats */}
                  {post.engagement && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.engagement.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.engagement.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.engagement.shares}
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Eye className="w-4 h-4" />
                        {post.engagement.reach.toLocaleString()} reach
                      </div>
                    </div>
                  )}

                  {/* Scheduled info */}
                  {post.status === 'scheduled' && post.scheduledAt && (
                    <div className="flex items-center gap-2 text-sm text-blue-500 mt-2">
                      <Clock className="w-4 h-4" />
                      Scheduled for {formatDate(post.scheduledAt)}
                    </div>
                  )}

                  {/* Published info */}
                  {post.status === 'published' && post.publishedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Published {formatDate(post.publishedAt)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {DEMO_CAMPAIGNS.map((campaign) => {
            const PlatformIcon = PLATFORM_CONFIG[campaign.platform as keyof typeof PLATFORM_CONFIG]?.icon;
            const budgetPercent = (campaign.spent / campaign.budget) * 100;
            return (
              <div key={campaign.id} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-white',
                      PLATFORM_CONFIG[campaign.platform as keyof typeof PLATFORM_CONFIG]?.color
                    )}>
                      {PlatformIcon && <PlatformIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="text-sm text-muted-foreground capitalize">
                        {campaign.platform} • {campaign.objective}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium capitalize',
                    campaign.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {campaign.status}
                  </span>
                </div>

                {/* Budget Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Budget: {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                    <span>{Math.round(budgetPercent)}% spent</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xl font-bold">{campaign.metrics.impressions?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Impressions</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xl font-bold">{campaign.metrics.clicks?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  {campaign.metrics.leads && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-500">{campaign.metrics.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                  )}
                  {campaign.metrics.costPerLead && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xl font-bold">{formatCurrency(campaign.metrics.costPerLead)}</div>
                      <div className="text-xs text-muted-foreground">Cost/Lead</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </div>
                  <button className="btn-secondary text-sm flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    View in Ads Manager
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Social Media Analytics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engagement by Platform */}
            <div>
              <h4 className="text-sm font-medium mb-4">Engagement by Platform</h4>
              <div className="space-y-3">
                {[
                  { platform: 'Instagram', engagement: 65, color: 'bg-pink-500' },
                  { platform: 'Facebook', engagement: 35, color: 'bg-blue-600' },
                ].map((item) => (
                  <div key={item.platform}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{item.platform}</span>
                      <span>{item.engagement}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', item.color)} style={{ width: `${item.engagement}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Content */}
            <div>
              <h4 className="text-sm font-medium mb-4">Top Performing Content</h4>
              <div className="space-y-3">
                {[
                  { type: 'Project Progress', engagement: 42 },
                  { type: 'Completed Homes', engagement: 28 },
                  { type: 'Team Spotlights', engagement: 18 },
                  { type: 'Tips & Advice', engagement: 12 },
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm">{item.type}</span>
                    <span className="text-sm font-medium">{item.engagement}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
