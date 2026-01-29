import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Search,
  Play,
  Pause,
  Download,
  MessageSquare,
  Clock,
  Building2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/calls/')({
  component: CallsPage,
});

const DEMO_CALLS = [
  {
    id: '1',
    direction: 'inbound',
    status: 'completed',
    fromNumber: '(956) 233-4567',
    toNumber: '(956) 428-3500',
    contactName: 'Eduardo Gonzalez',
    contactType: 'homeowner',
    projectName: 'Gonzalez Residence - Belmont Ridge',
    duration: 420,
    recordingUrl: '/recordings/call-1.mp3',
    transcription: "Hi Carlos, I wanted to check on the framing progress. Are we still on track for the roof installation next week? Also, my wife wanted to know if we can make a small change to the master bathroom layout...",
    aiSummary: 'Homeowner inquired about framing timeline and requested bathroom layout change. Confirmed on track for Feb 3 roof installation. Change order needed for bathroom modification.',
    aiKeywords: ['framing', 'roof', 'change order', 'bathroom'],
    sentimentScore: 0.75,
    riskDetected: false,
    startedAt: new Date('2025-01-28T14:30:00'),
    endedAt: new Date('2025-01-28T14:37:00'),
  },
  {
    id: '2',
    direction: 'outbound',
    status: 'completed',
    fromNumber: '(956) 428-3500',
    toNumber: '(956) 380-4422',
    contactName: 'David Flores',
    contactType: 'subcontractor',
    companyName: 'Precision Framing LLC',
    projectName: 'Trevino Residence',
    duration: 185,
    transcription: "David, we need to discuss the delay on the Trevino project. The inspection was supposed to be yesterday but your crew wasn't ready...",
    aiSummary: 'Discussed framing delay on Trevino project. Sub acknowledged crew scheduling issue. Committed to completing by Friday.',
    aiKeywords: ['delay', 'inspection', 'scheduling'],
    sentimentScore: 0.35,
    riskDetected: true,
    riskDetails: 'Subcontractor reliability concern - 2nd delay this month',
    startedAt: new Date('2025-01-28T11:15:00'),
    endedAt: new Date('2025-01-28T11:18:05'),
  },
  {
    id: '3',
    direction: 'inbound',
    status: 'missed',
    fromNumber: '(956) 781-2234',
    toNumber: '(956) 428-3501',
    contactName: 'Sofia Trevino',
    contactType: 'homeowner',
    projectName: 'Trevino Residence - Palm Valley',
    startedAt: new Date('2025-01-28T09:45:00'),
  },
  {
    id: '4',
    direction: 'inbound',
    status: 'voicemail',
    fromNumber: '(956) 555-9876',
    toNumber: '(956) 428-3500',
    contactName: 'New Lead',
    contactType: 'lead',
    duration: 45,
    transcription: "Hi, my name is James Wilson. I'm interested in building a custom home in the McAllen area. Please call me back at 956-555-9876. Thank you.",
    aiSummary: 'New lead interested in custom home in McAllen. Follow-up required.',
    aiKeywords: ['custom home', 'McAllen', 'new lead'],
    sentimentScore: 0.8,
    startedAt: new Date('2025-01-27T16:20:00'),
  },
  {
    id: '5',
    direction: 'outbound',
    status: 'completed',
    fromNumber: '(956) 428-3500',
    toNumber: '(956) 664-8800',
    contactName: 'Ricardo Morales',
    contactType: 'subcontractor',
    companyName: 'South Texas Roofing',
    projectName: 'Gonzalez Residence',
    duration: 312,
    aiSummary: 'Confirmed roof truss delivery for Feb 3. Discussed crew availability and weather contingency plan.',
    aiKeywords: ['roof', 'delivery', 'weather'],
    sentimentScore: 0.85,
    riskDetected: false,
    startedAt: new Date('2025-01-27T10:00:00'),
    endedAt: new Date('2025-01-27T10:05:12'),
  },
];

function CallsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<typeof DEMO_CALLS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound' | 'missed'>('all');

  const filteredCalls = DEMO_CALLS.filter((call) => {
    if (filter !== 'all' && call.direction !== filter && call.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        call.contactName?.toLowerCase().includes(query) ||
        call.fromNumber.includes(query) ||
        call.projectName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: DEMO_CALLS.length,
    inbound: DEMO_CALLS.filter((c) => c.direction === 'inbound').length,
    outbound: DEMO_CALLS.filter((c) => c.direction === 'outbound').length,
    missed: DEMO_CALLS.filter((c) => c.status === 'missed').length,
    avgDuration: Math.round(
      DEMO_CALLS.filter((c) => c.duration).reduce((sum, c) => sum + (c.duration || 0), 0) /
        DEMO_CALLS.filter((c) => c.duration).length
    ),
    risksDetected: DEMO_CALLS.filter((c) => c.riskDetected).length,
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: typeof DEMO_CALLS[0]) => {
    if (call.status === 'missed') return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (call.status === 'voicemail') return <Voicemail className="w-4 h-4 text-yellow-500" />;
    if (call.direction === 'inbound') return <PhoneIncoming className="w-4 h-4 text-green-500" />;
    return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Villa Phone
          </h1>
          <p className="text-muted-foreground">Call history with AI transcription and insights</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Phone className="w-4 h-4" />
          New Call
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Calls</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold">{stats.inbound}</span>
          </div>
          <div className="text-sm text-muted-foreground">Inbound</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <PhoneOutgoing className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{stats.outbound}</span>
          </div>
          <div className="text-sm text-muted-foreground">Outbound</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <PhoneMissed className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold">{stats.missed}</span>
          </div>
          <div className="text-sm text-muted-foreground">Missed</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</span>
          </div>
          <div className="text-sm text-muted-foreground">Avg Duration</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.risksDetected}</span>
          </div>
          <div className="text-sm text-muted-foreground">Risks Detected</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'inbound', 'outbound', 'missed'] as const).map((f) => (
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
      </div>

      {/* Call List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Recent Calls</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={cn(
                  'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                  selectedCall?.id === call.id && 'bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getCallIcon(call)}
                    <div>
                      <div className="font-medium">{call.contactName}</div>
                      <div className="text-sm text-muted-foreground">{call.fromNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{formatDate(call.startedAt)}</div>
                    {call.duration && (
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(call.duration)}
                      </div>
                    )}
                  </div>
                </div>
                {call.projectName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building2 className="w-3 h-3" />
                    {call.projectName}
                  </div>
                )}
                {call.aiSummary && (
                  <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2">
                    <Sparkles className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{call.aiSummary}</span>
                  </div>
                )}
                {call.riskDetected && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    Risk detected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call Detail */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {selectedCall ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCallIcon(selectedCall)}
                    <div>
                      <h2 className="font-semibold">{selectedCall.contactName}</h2>
                      <div className="text-sm text-muted-foreground">
                        {selectedCall.direction === 'inbound' ? 'Incoming' : 'Outgoing'} •{' '}
                        {formatDate(selectedCall.startedAt)}
                      </div>
                    </div>
                  </div>
                  {selectedCall.duration && (
                    <div className="text-lg font-mono">
                      {formatDuration(selectedCall.duration)}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Recording Player */}
                {selectedCall.recordingUrl && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Recording</span>
                      <button className="p-1 hover:bg-background rounded">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3 rounded-full" />
                      </div>
                      <span className="text-sm font-mono">
                        {formatDuration(selectedCall.duration || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {selectedCall.aiSummary && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium">AI Summary</span>
                    </div>
                    <p className="text-sm bg-secondary/10 rounded-lg p-3">
                      {selectedCall.aiSummary}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {selectedCall.aiKeywords && (
                  <div>
                    <span className="text-sm font-medium">Keywords Detected</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCall.aiKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sentiment */}
                {selectedCall.sentimentScore !== undefined && (
                  <div>
                    <span className="text-sm font-medium">Sentiment Analysis</span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            selectedCall.sentimentScore >= 0.6
                              ? 'bg-green-500'
                              : selectedCall.sentimentScore >= 0.4
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${selectedCall.sentimentScore * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedCall.sentimentScore >= 0.6
                          ? 'Positive'
                          : selectedCall.sentimentScore >= 0.4
                          ? 'Neutral'
                          : 'Negative'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Risk Alert */}
                {selectedCall.riskDetected && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-500 font-medium mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Detected
                    </div>
                    <p className="text-sm">{selectedCall.riskDetails}</p>
                  </div>
                )}

                {/* Transcription */}
                {selectedCall.transcription && (
                  <div>
                    <span className="text-sm font-medium">Transcription</span>
                    <div className="mt-2 bg-muted rounded-lg p-3 text-sm max-h-48 overflow-y-auto">
                      {selectedCall.transcription}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Back
                  </button>
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send SMS
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              Select a call to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
