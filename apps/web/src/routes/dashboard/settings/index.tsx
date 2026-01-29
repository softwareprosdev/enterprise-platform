import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Building2,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Key,
  Smartphone,
  Users,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
});

type SettingsTab = 'company' | 'profile' | 'notifications' | 'security' | 'team' | 'integrations';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const { data: user } = trpc.auth.me.useQuery();
  const { data: tenant } = trpc.tenants.getCurrent.useQuery();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and company preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-card rounded-xl border border-border p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'company' && <CompanySettings tenant={tenant} />}
          {activeTab === 'profile' && <ProfileSettings user={user} />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'integrations' && <IntegrationSettings />}
        </div>
      </div>
    </div>
  );
}

function CompanySettings({ tenant }: { tenant: any }) {
  const [formData, setFormData] = useState({
    name: tenant?.name || 'Villa Homes RGV',
    phone: '(956) 428-3500',
    email: 'info@villahomes.ai',
    address: '1120 W Jefferson Ave, Harlingen, TX 78550',
    website: 'https://villahomes.ai',
    licenseNumber: 'TX-HB-45219',
    defaultMarkup: 18,
    warrantyMonths: 12,
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Company Information</h2>
        <p className="text-sm text-muted-foreground">Update your company details and branding</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <button className="btn-secondary flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Upload Logo
            </button>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">License Number</label>
            <input
              type="text"
              className="input"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                className="input pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                className="input pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                className="input pl-10"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Default Markup %</label>
            <input
              type="number"
              className="input"
              value={formData.defaultMarkup}
              onChange={(e) => setFormData({ ...formData, defaultMarkup: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Warranty Period (months)</label>
            <input
              type="number"
              className="input"
              value={formData.warrantyMonths}
              onChange={(e) => setFormData({ ...formData, warrantyMonths: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user?.name || 'Carlos Martinez',
    email: user?.email || 'carlos.martinez@villahomes.ai',
    phone: '(956) 428-3500',
    title: 'Owner & CEO',
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Update your personal information</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-white text-2xl font-bold">
            {formData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <button className="btn-secondary flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Change Photo
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailProjectUpdates: true,
    emailTaskAssignments: true,
    emailClientMessages: true,
    emailWeeklyDigest: false,
    pushNewTasks: true,
    pushUrgentAlerts: true,
    pushClientPortal: true,
    smsUrgentOnly: true,
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'emailProjectUpdates', label: 'Project updates and milestones' },
              { key: 'emailTaskAssignments', label: 'Task assignments and completions' },
              { key: 'emailClientMessages', label: 'Client messages and portal activity' },
              { key: 'emailWeeklyDigest', label: 'Weekly summary digest' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Push Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'pushNewTasks', label: 'New task assignments' },
              { key: 'pushUrgentAlerts', label: 'Urgent alerts and risks' },
              { key: 'pushClientPortal', label: 'Client portal activity' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Key className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>

      {/* MFA */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                mfaEnabled ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
              )}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="font-medium">Authenticator App</div>
                <div className="text-sm text-muted-foreground">
                  {mfaEnabled ? 'Enabled and protecting your account' : 'Not configured'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={cn('btn-secondary', mfaEnabled && 'bg-green-500/20 text-green-500 border-green-500/30')}
            >
              {mfaEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Chrome on MacOS</div>
                <div className="text-xs text-muted-foreground">McAllen, TX • Current session</div>
              </div>
            </div>
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  const { data: users } = trpc.users.list.useQuery({});

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">Manage your team and permissions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="divide-y divide-border">
        {(users?.items || []).slice(0, 10).map((member: any) => (
          <div key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                {member.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </div>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                member.role === 'owner' ? 'bg-primary/20 text-primary' :
                member.role === 'project_manager' ? 'bg-blue-500/20 text-blue-500' :
                'bg-muted text-muted-foreground'
              )}>
                {member.role?.replace('_', ' ')}
              </span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const integrations = [
    { name: 'QuickBooks', description: 'Sync invoices and expenses', connected: true, icon: '📊' },
    { name: 'Buildertrend', description: 'Import projects and schedules', connected: false, icon: '🏗️' },
    { name: 'DocuSign', description: 'E-signatures for contracts', connected: true, icon: '✍️' },
    { name: 'Twilio', description: 'SMS and voice communications', connected: true, icon: '📱' },
    { name: 'Stripe', description: 'Payment processing', connected: true, icon: '💳' },
    { name: 'Google Calendar', description: 'Sync schedules and meetings', connected: false, icon: '📅' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">Connect Villa Homes with your favorite tools</p>
      </div>

      <div className="divide-y divide-border">
        {integrations.map((integration) => (
          <div key={integration.name} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                {integration.icon}
              </div>
              <div>
                <div className="font-medium">{integration.name}</div>
                <div className="text-sm text-muted-foreground">{integration.description}</div>
              </div>
            </div>
            <button className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              integration.connected
                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                : 'bg-muted hover:bg-muted/80'
            )}>
              {integration.connected ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
