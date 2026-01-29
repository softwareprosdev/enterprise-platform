import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plane,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Image,
  Download,
  Plus,
  Settings,
  BarChart3,
  Layers,
  Eye,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/drones/')({
  component: DronesPage,
});

const DEMO_FLIGHTS = [
  {
    id: '1',
    projectName: 'Madeira at Brownsville',
    droneModel: 'DJI Phantom 4 Pro',
    status: 'completed',
    scheduledAt: new Date('2025-01-28T09:00:00'),
    completedAt: new Date('2025-01-28T09:45:00'),
    duration: 45,
    distance: 2.4,
    altitude: 50,
    imagesCount: 127,
    pilotName: 'Juan Hernandez',
    aiProgress: 23,
    previousProgress: 18,
  },
  {
    id: '2',
    projectName: 'Azure Tower - South Padre',
    droneModel: 'DJI Mavic 3 Enterprise',
    status: 'scheduled',
    scheduledAt: new Date('2025-01-29T14:00:00'),
    altitude: 80,
    pilotName: 'Roberto Gonzalez',
  },
  {
    id: '3',
    projectName: 'Valley Medical Plaza',
    droneModel: 'DJI Phantom 4 Pro',
    status: 'completed',
    scheduledAt: new Date('2025-01-27T10:00:00'),
    completedAt: new Date('2025-01-27T10:38:00'),
    duration: 38,
    distance: 1.8,
    altitude: 60,
    imagesCount: 94,
    pilotName: 'Juan Hernandez',
    aiProgress: 42,
    previousProgress: 38,
  },
  {
    id: '4',
    projectName: 'Gonzalez Residence',
    droneModel: 'DJI Mini 3 Pro',
    status: 'in_progress',
    scheduledAt: new Date('2025-01-29T10:00:00'),
    startedAt: new Date('2025-01-29T10:02:00'),
    altitude: 30,
    pilotName: 'Antonio Vargas',
    liveProgress: 65,
  },
];

const DEMO_IMAGES = [
  { id: '1', url: '/drone/madeira-1.jpg', caption: 'Phase 1 Overview', progress: 23, date: new Date('2025-01-28') },
  { id: '2', url: '/drone/madeira-2.jpg', caption: 'Foundation Work', progress: 23, date: new Date('2025-01-28') },
  { id: '3', url: '/drone/madeira-3.jpg', caption: 'Infrastructure', progress: 23, date: new Date('2025-01-28') },
  { id: '4', url: '/drone/medical-1.jpg', caption: 'Steel Structure', progress: 42, date: new Date('2025-01-27') },
];

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-500', icon: Calendar },
  in_progress: { label: 'In Flight', color: 'bg-green-500', icon: Plane },
  completed: { label: 'Completed', color: 'bg-gray-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: AlertTriangle },
};

function DronesPage() {
  const [selectedFlight, setSelectedFlight] = useState<typeof DEMO_FLIGHTS[0] | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);

  const stats = {
    totalFlights: DEMO_FLIGHTS.length,
    completedToday: DEMO_FLIGHTS.filter(f => f.status === 'completed').length,
    scheduledToday: DEMO_FLIGHTS.filter(f => f.status === 'scheduled').length,
    totalImages: DEMO_FLIGHTS.reduce((sum, f) => sum + (f.imagesCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Drone Operations
          </h1>
          <p className="text-muted-foreground">DJI integration with AI progress detection</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Flight Plans
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Flight
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalFlights}</div>
              <div className="text-sm text-muted-foreground">Total Flights</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.scheduledToday}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Image className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalImages}</div>
              <div className="text-sm text-muted-foreground">Images Captured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Recent Flights</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {DEMO_FLIGHTS.map((flight) => {
              const StatusIcon = STATUS_CONFIG[flight.status as keyof typeof STATUS_CONFIG]?.icon || Calendar;
              return (
                <div
                  key={flight.id}
                  onClick={() => setSelectedFlight(flight)}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    selectedFlight?.id === flight.id && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{flight.projectName}</div>
                      <div className="text-sm text-muted-foreground">{flight.droneModel}</div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      STATUS_CONFIG[flight.status as keyof typeof STATUS_CONFIG]?.color
                    )}>
                      {STATUS_CONFIG[flight.status as keyof typeof STATUS_CONFIG]?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(flight.scheduledAt)}
                    </div>
                    {flight.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {flight.duration} min
                      </div>
                    )}
                  </div>

                  {flight.status === 'in_progress' && flight.liveProgress && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Flight Progress</span>
                        <span>{flight.liveProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full animate-pulse"
                          style={{ width: `${flight.liveProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {flight.aiProgress !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-secondary" />
                      <span className="text-sm">
                        AI Progress: <strong>{flight.aiProgress}%</strong>
                        {flight.previousProgress && (
                          <span className="text-green-500 ml-1">
                            (+{flight.aiProgress - flight.previousProgress}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Flight Detail / Imagery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Before/After Comparison */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" />
                AI Progress Comparison
              </h2>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  showComparison ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
            </div>

            <div className="relative h-80 bg-muted/30">
              {showComparison ? (
                <div className="relative h-full">
                  {/* Before Image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">January 21, 2025</p>
                      <p className="text-sm opacity-75">18% Complete</p>
                    </div>
                  </div>
                  
                  {/* After Image (clipped) */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` }}
                  >
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">January 28, 2025</p>
                      <p className="text-sm opacity-75">23% Complete</p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                    style={{ left: `${comparisonPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-gray-400 rounded" />
                        <div className="w-0.5 h-4 bg-gray-400 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Slider control */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonPosition}
                    onChange={(e) => setComparisonPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  />

                  {/* Labels */}
                  <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 rounded text-white text-xs">
                    Before
                  </div>
                  <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 rounded text-white text-xs">
                    After
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">Click "Show Comparison" to view before/after</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Recent Captures</h2>
              <button className="btn-secondary text-sm flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {DEMO_IMAGES.map((image) => (
                <div key={image.id} className="group relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-medium truncate">{image.caption}</p>
                    <p className="text-white/70 text-xs">{formatDate(image.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {selectedFlight && selectedFlight.aiProgress !== undefined && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                AI Progress Analysis - {selectedFlight.projectName}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{selectedFlight.aiProgress}%</div>
                  <div className="text-sm text-muted-foreground">Current Progress</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-500">
                    +{(selectedFlight.aiProgress || 0) - (selectedFlight.previousProgress || 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Since Last Flight</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{selectedFlight.imagesCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Images Analyzed</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm text-muted-foreground">AI Confidence</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
