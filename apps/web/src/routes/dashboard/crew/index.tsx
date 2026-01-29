import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Truck,
  Phone,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/crew/')({
  component: CrewTrackingPage,
});

const DEMO_CREW = [
  {
    id: '1',
    name: 'Juan Hernandez',
    role: 'Field Superintendent',
    phone: '(956) 428-3504',
    status: 'clocked_in',
    currentProject: 'Gonzalez Residence - Belmont Ridge',
    projectAddress: '2401 Belmont Ridge Dr, Harlingen',
    clockedInAt: new Date('2025-01-29T07:02:00'),
    location: { lat: 26.1906, lng: -97.6961 },
    lastUpdate: new Date('2025-01-29T10:15:00'),
    hoursToday: 3.2,
    avatar: 'JH',
  },
  {
    id: '2',
    name: 'Miguel Torres',
    role: 'Project Manager',
    phone: '(956) 428-3505',
    status: 'clocked_in',
    currentProject: 'Trevino Residence - Palm Valley',
    projectAddress: '3890 Palm Valley Blvd, McAllen',
    clockedInAt: new Date('2025-01-29T07:15:00'),
    location: { lat: 26.2034, lng: -98.2300 },
    lastUpdate: new Date('2025-01-29T10:12:00'),
    hoursToday: 3.0,
    avatar: 'MT',
  },
  {
    id: '3',
    name: 'Roberto Gonzalez',
    role: 'VP of Construction',
    phone: '(956) 428-3506',
    status: 'in_transit',
    destination: 'Madeira at Brownsville',
    eta: '10:45 AM',
    location: { lat: 26.0834, lng: -97.8123 },
    lastUpdate: new Date('2025-01-29T10:18:00'),
    hoursToday: 2.5,
    avatar: 'RG',
  },
  {
    id: '4',
    name: 'Antonio Vargas',
    role: 'Site Superintendent',
    phone: '(956) 428-3507',
    status: 'on_break',
    currentProject: 'Valley Medical Plaza',
    projectAddress: '5800 N. 10th Street, McAllen',
    clockedInAt: new Date('2025-01-29T06:45:00'),
    breakStartedAt: new Date('2025-01-29T10:00:00'),
    location: { lat: 26.2456, lng: -98.2134 },
    lastUpdate: new Date('2025-01-29T10:05:00'),
    hoursToday: 3.5,
    avatar: 'AV',
  },
  {
    id: '5',
    name: 'Carmen Salazar',
    role: 'Site Superintendent',
    phone: '(956) 428-3508',
    status: 'clocked_out',
    lastProject: 'Azure Tower - South Padre',
    clockedOutAt: new Date('2025-01-28T17:30:00'),
    avatar: 'CS',
  },
  {
    id: '6',
    name: 'Luis Mendoza',
    role: 'Quality Control',
    phone: '(956) 428-3509',
    status: 'not_checked_in',
    scheduledProject: 'Salinas Residence - Resaca Heights',
    scheduledTime: '07:00 AM',
    avatar: 'LM',
    alert: true,
  },
];

const STATUS_CONFIG = {
  clocked_in: { label: 'On Site', color: 'bg-green-500', icon: CheckCircle2 },
  in_transit: { label: 'In Transit', color: 'bg-blue-500', icon: Truck },
  on_break: { label: 'On Break', color: 'bg-yellow-500', icon: Coffee },
  clocked_out: { label: 'Clocked Out', color: 'bg-gray-500', icon: Clock },
  not_checked_in: { label: 'Not Checked In', color: 'bg-red-500', icon: AlertTriangle },
};

function CrewTrackingPage() {
  const [selectedCrew, setSelectedCrew] = useState<typeof DEMO_CREW[0] | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredCrew = DEMO_CREW.filter((crew) => {
    if (filter === 'all') return true;
    return crew.status === filter;
  });

  const stats = {
    onSite: DEMO_CREW.filter((c) => c.status === 'clocked_in').length,
    inTransit: DEMO_CREW.filter((c) => c.status === 'in_transit').length,
    onBreak: DEMO_CREW.filter((c) => c.status === 'on_break').length,
    notCheckedIn: DEMO_CREW.filter((c) => c.status === 'not_checked_in').length,
    totalHoursToday: DEMO_CREW.reduce((sum, c) => sum + (c.hoursToday || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6" />
            GPS Crew Tracking
          </h1>
          <p className="text-muted-foreground">Real-time location and time tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Time Reports
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.onSite}</div>
              <div className="text-sm text-muted-foreground">On Site</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.onBreak}</div>
              <div className="text-sm text-muted-foreground">On Break</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.notCheckedIn}</div>
              <div className="text-sm text-muted-foreground">Not Checked In</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalHoursToday.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Total Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {['all', 'clocked_in', 'in_transit', 'on_break', 'not_checked_in'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            {f === 'all' ? 'All' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label}
          </button>
        ))}
      </div>

      {/* Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Live Map</h2>
            <span className="text-xs text-muted-foreground">Last updated: Just now</span>
          </div>
          <div className="relative h-[500px] bg-muted/30">
            {/* Map placeholder - would integrate with Google Maps or Mapbox */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map with crew locations</p>
                <p className="text-sm text-muted-foreground">Integrate with Google Maps or Mapbox</p>
              </div>
            </div>
            
            {/* Crew markers overlay */}
            <div className="absolute top-4 left-4 space-y-2">
              {filteredCrew.filter(c => c.location).slice(0, 4).map((crew) => {
                const StatusIcon = STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
                return (
                  <div
                    key={crew.id}
                    onClick={() => setSelectedCrew(crew)}
                    className={cn(
                      'flex items-center gap-2 bg-card rounded-lg p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow',
                      selectedCrew?.id === crew.id && 'ring-2 ring-primary'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                      STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.color
                    )}>
                      {crew.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{crew.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Crew List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Crew Status</h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {filteredCrew.map((crew) => {
              const StatusIcon = STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
              return (
                <div
                  key={crew.id}
                  onClick={() => setSelectedCrew(crew)}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    selectedCrew?.id === crew.id && 'bg-muted/50',
                    crew.alert && 'bg-red-500/5'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                        STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.color
                      )}>
                        {crew.avatar}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {crew.name}
                          {crew.alert && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{crew.role}</div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className={cn(
                      'font-medium',
                      crew.status === 'not_checked_in' && 'text-red-500'
                    )}>
                      {STATUS_CONFIG[crew.status as keyof typeof STATUS_CONFIG]?.label}
                    </span>
                  </div>

                  {crew.currentProject && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {crew.currentProject}
                    </div>
                  )}

                  {crew.destination && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      En route to {crew.destination} • ETA {crew.eta}
                    </div>
                  )}

                  {crew.hoursToday !== undefined && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {crew.hoursToday.toFixed(1)} hours today
                    </div>
                  )}

                  {crew.alert && (
                    <div className="mt-2 text-sm text-red-500">
                      Scheduled for {crew.scheduledTime} - Not checked in
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                    <button className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Text
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
