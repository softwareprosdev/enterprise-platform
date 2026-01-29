import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Phone,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Home,
  HardHat,
  Target,
  Navigation,
  Plane,
  Shield,
  Share2,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { cn, getInitials } from '@/lib/utils';
import { VillaAIAssistant } from '@/components/villa/VillaAIAssistant';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
});

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/dashboard/leads', icon: Target, label: 'Leads' },
  { to: '/dashboard/homeowners', icon: Users, label: 'Homeowners' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/dashboard/subcontractors', icon: HardHat, label: 'Subcontractors' },
  { to: '/dashboard/calls', icon: Phone, label: 'Villa Phone' },
  { to: '/dashboard/contacts', icon: MessageSquare, label: 'Contacts' },
  { to: '/dashboard/crew', icon: Navigation, label: 'Crew Tracking' },
  { to: '/dashboard/drones', icon: Plane, label: 'Drones' },
  { to: '/dashboard/safety', icon: Shield, label: 'Safety' },
  { to: '/dashboard/social', icon: Share2, label: 'Social Media' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'AI Analytics' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: session } = trpc.auth.me.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1e3a5f]">Villa Homes</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace selector */}
        <div className="p-4 border-b border-border">
          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/20 flex items-center justify-center text-[#1e3a5f] font-semibold text-sm">
                <HardHat className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium truncate max-w-32">
                  {session?.tenant?.name || 'Villa Homes'}
                </div>
                <div className="text-xs text-muted-foreground">
                  General Contractor
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                    : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-semibold">
              {session?.user?.name ? getInitials(session.user.name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {session?.user?.email || 'user@villahomes.com'}
              </div>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-full px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects, homeowners, subs..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e85d04] rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Villa AI Assistant */}
      <VillaAIAssistant />
    </div>
  );
}
