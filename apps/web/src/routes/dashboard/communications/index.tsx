import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  MessageSquare,
  Mail,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  PhoneCall,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, statusColors, formatDateTime, formatRelativeTime, formatPhoneNumber } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/communications/')({
  component: CommunicationsPage,
});

type CommunicationType = 'call_inbound' | 'call_outbound' | 'call_missed' | 'call_voicemail' | 'sms_inbound' | 'sms_outbound' | 'email_inbound' | 'email_outbound';
type CommunicationStatus = 'completed' | 'pending_follow_up' | 'urgent';

const typeOptions: { value: CommunicationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Communications' },
  { value: 'call_inbound', label: 'Incoming Calls' },
  { value: 'call_outbound', label: 'Outgoing Calls' },
  { value: 'call_missed', label: 'Missed Calls' },
  { value: 'call_voicemail', label: 'Voicemails' },
  { value: 'sms_inbound', label: 'Incoming SMS' },
  { value: 'sms_outbound', label: 'Outgoing SMS' },
  { value: 'email_inbound', label: 'Incoming Email' },
  { value: 'email_outbound', label: 'Outgoing Email' },
];

const statusOptions: { value: CommunicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending_follow_up', label: 'Pending Follow-up' },
  { value: 'urgent', label: 'Urgent' },
];

function CommunicationsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunicationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | 'all'>('all');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showDialer, setShowDialer] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  const { data, isLoading } = trpc.communications.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    urgent: showUrgentOnly || undefined,
  });

  const communications = data?.communications ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const urgentCount = data?.urgentCount ?? 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call_inbound':
        return PhoneIncoming;
      case 'call_outbound':
        return PhoneOutgoing;
      case 'call_missed':
        return PhoneMissed;
      case 'call_voicemail':
        return Voicemail;
      case 'sms_inbound':
      case 'sms_outbound':
        return MessageSquare;
      case 'email_inbound':
      case 'email_outbound':
        return Mail;
      default:
        return Phone;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      call_inbound: 'Incoming Call',
      call_outbound: 'Outgoing Call',
      call_missed: 'Missed Call',
      call_voicemail: 'Voicemail',
      sms_inbound: 'Incoming SMS',
      sms_outbound: 'Outgoing SMS',
      email_inbound: 'Incoming Email',
      email_outbound: 'Outgoing Email',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      call_inbound: 'text-green-500',
      call_outbound: 'text-blue-500',
      call_missed: 'text-red-500',
      call_voicemail: 'text-purple-500',
      sms_inbound: 'text-green-500',
      sms_outbound: 'text-blue-500',
      email_inbound: 'text-green-500',
      email_outbound: 'text-blue-500',
    };
    return colors[type] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Calls, texts, and emails with homeowners and subcontractors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDialer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Make Call
          </button>
        </div>
      </div>

      {/* Urgent alerts */}
      {urgentCount > 0 && !showUrgentOnly && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <span className="font-medium text-red-500">{urgentCount} urgent communication{urgentCount !== 1 ? 's' : ''}</span>
            <span className="text-muted-foreground ml-2">requiring follow-up</span>
          </div>
          <button
            onClick={() => {
              setShowUrgentOnly(true);
              setPage(1);
            }}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            View all
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search communications, numbers, or content..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as CommunicationType | 'all');
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as CommunicationStatus | 'all');
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Urgent toggle */}
        <button
          onClick={() => {
            setShowUrgentOnly(!showUrgentOnly);
            setPage(1);
          }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            showUrgentOnly
              ? 'bg-red-500 text-white'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Urgent Only
        </button>
      </div>

      {/* Communications list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading communications...
          </div>
        ) : communications.length === 0 ? (
          <div className="p-8 text-center">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No communications found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search || typeFilter !== 'all' || statusFilter !== 'all' || showUrgentOnly
                ? 'Try adjusting your filters'
                : 'Communications will appear here when calls, texts, or emails are made'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-3">Linked To</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1"></div>
            </div>

            {/* Communication rows */}
            <div className="divide-y divide-border">
              {communications.map((comm) => {
                const TypeIcon = getTypeIcon(comm.type);
                const isCall = comm.type.startsWith('call_');
                const hasRecording = isCall && comm.recordingUrl;

                return (
                  <div
                    key={comm.id}
                    className={cn(
                      'block px-6 py-4 hover:bg-card-hover transition-colors cursor-pointer',
                      selectedCommunication === comm.id && 'bg-[#1e3a5f]/5',
                      comm.detectedRisk && 'border-l-4 border-l-red-500'
                    )}
                    onClick={() => setSelectedCommunication(selectedCommunication === comm.id ? null : comm.id)}
                  >
                    <div className="md:grid md:grid-cols-12 gap-4 items-start">
                      {/* Type */}
                      <div className="col-span-2 flex items-center gap-2 mb-3 md:mb-0">
                        <TypeIcon className={cn('w-5 h-5', getTypeColor(comm.type))} />
                        <div>
                          <div className="text-sm font-medium">{getTypeLabel(comm.type)}</div>
                          {comm.durationSeconds && (
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(comm.durationSeconds / 60)}:{(comm.durationSeconds % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-span-2 mb-3 md:mb-0">
                        <div className="text-sm font-medium">
                          {comm.fromNumber || comm.toNumber || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPhoneNumber(comm.fromNumber || comm.toNumber || '')}
                        </div>
                      </div>

                      {/* Linked To */}
                      <div className="col-span-3 mb-3 md:mb-0">
                        {comm.project ? (
                          <div>
                            <div className="text-sm font-medium truncate">{comm.project.name}</div>
                            <div className="text-xs text-muted-foreground">Project</div>
                          </div>
                        ) : comm.homeowner ? (
                          <div>
                            <div className="text-sm font-medium truncate">
                              {comm.homeowner.firstName} {comm.homeowner.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">Homeowner</div>
                          </div>
                        ) : comm.subcontractor ? (
                          <div>
                            <div className="text-sm font-medium truncate">{comm.subcontractor.companyName}</div>
                            <div className="text-xs text-muted-foreground">Subcontractor</div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not linked</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2 mb-3 md:mb-0">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusColors[comm.status] || statusColors.completed
                          )}
                        >
                          {comm.status === 'pending_follow_up' ? 'Follow-up' : comm.status}
                        </span>
                        {comm.detectedRisk && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-500">Risk detected</span>
                          </div>
                        )}
                        {comm.aiSummary && (
                          <div className="text-xs text-muted-foreground mt-1">
                            AI analyzed
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 mb-3 md:mb-0">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(comm.createdAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(comm.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        {hasRecording && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingRecording(playingRecording === comm.id ? null : comm.id);
                            }}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                          >
                            {playingRecording === comm.id ? (
                              <Pause className="w-4 h-4 text-primary" />
                            ) : (
                              <Play className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedCommunication === comm.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        {comm.aiSummary && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                              {comm.aiSummary}
                            </p>
                          </div>
                        )}
                        {comm.body && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Content</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                              {comm.body}
                            </p>
                          </div>
                        )}
                        {(() => {
                          const items = comm.actionItems as string[] | null;
                          if (!items || !Array.isArray(items) || items.length === 0) return null;
                          return (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Action Items</h4>
                              <ul className="space-y-1">
                                {items.map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                        {playingRecording === comm.id && comm.recordingUrl && (
                          <div className="mt-4">
                            <audio controls className="w-full">
                              <source src={comm.recordingUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialer Modal */}
      {showDialer && (
        <DialerModal onClose={() => setShowDialer(false)} />
      )}
    </div>
  );
}

function DialerModal({ onClose }: { onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);
    // TODO: Implement actual call functionality via Twilio
    setTimeout(() => {
      setIsCalling(false);
      onClose();
    }, 2000);
  };

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Make Call</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Phone number display */}
          <div className="text-center">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-border focus:border-[#1e3a5f] focus:outline-none py-2"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Dial pad */}
          <div className="grid grid-cols-3 gap-3">
            {dialPad.flat().map((digit) => (
              <button
                key={digit}
                onClick={() => setPhoneNumber(phoneNumber + digit)}
                className="w-full aspect-square rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center text-xl font-semibold"
              >
                {digit}
              </button>
            ))}
          </div>

          {/* Call button */}
          <button
            onClick={handleCall}
            disabled={!phoneNumber || isCalling}
            className="w-full py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isCalling ? (
              <>
                <span className="animate-spin">⟳</span>
                Calling...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Call
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
