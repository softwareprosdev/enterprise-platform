import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Building2,
  Home,
  Briefcase,
  Clock,
  ChevronRight,
  Filter,
  Plus,
  Star,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/contacts/')({
  component: ContactsPage,
});

const DEMO_CONTACTS = [
  {
    id: '1',
    name: 'Eduardo Gonzalez',
    type: 'homeowner',
    email: 'eduardo.gonzalez@email.com',
    phone: '(956) 233-4567',
    company: null,
    projectName: 'Gonzalez Residence - Belmont Ridge',
    status: 'construction',
    lastContact: new Date('2025-01-28T14:30:00'),
    isFavorite: true,
    timeline: [
      { type: 'call', direction: 'inbound', date: new Date('2025-01-28T14:30:00'), duration: 420, summary: 'Discussed framing progress and bathroom layout change' },
      { type: 'sms', direction: 'outbound', date: new Date('2025-01-27T10:15:00'), content: 'Will be on site at 2pm for walkthrough' },
      { type: 'email', direction: 'inbound', date: new Date('2025-01-26T16:00:00'), subject: 'RE: Change Order #3' },
      { type: 'portal', date: new Date('2025-01-24'), action: 'Approved selection: Flooring Option B' },
      { type: 'call', direction: 'outbound', date: new Date('2025-01-22T11:00:00'), duration: 180, summary: 'Weekly progress update call' },
    ],
  },
  {
    id: '2',
    name: 'Sofia Trevino',
    type: 'homeowner',
    email: 'sofia.trevino@gmail.com',
    phone: '(956) 781-2234',
    projectName: 'Trevino Residence - Palm Valley',
    status: 'construction',
    lastContact: new Date('2025-01-28T09:45:00'),
    timeline: [
      { type: 'call', direction: 'inbound', date: new Date('2025-01-28T09:45:00'), missed: true },
      { type: 'sms', direction: 'outbound', date: new Date('2025-01-28T10:00:00'), content: 'Sorry I missed your call. Available after 2pm today.' },
      { type: 'portal', date: new Date('2025-01-27'), action: 'Viewed project photos' },
    ],
  },
  {
    id: '3',
    name: 'David Flores',
    type: 'subcontractor',
    email: 'david@precisionframing.com',
    phone: '(956) 380-4422',
    company: 'Precision Framing LLC',
    trade: 'Framing',
    rating: 4.2,
    lastContact: new Date('2025-01-28T11:15:00'),
    timeline: [
      { type: 'call', direction: 'outbound', date: new Date('2025-01-28T11:15:00'), duration: 185, summary: 'Discussed framing delay on Trevino project', risk: true },
      { type: 'email', direction: 'outbound', date: new Date('2025-01-25T09:00:00'), subject: 'Schedule Update Request' },
    ],
  },
  {
    id: '4',
    name: 'Ricardo Morales',
    type: 'subcontractor',
    email: 'ricardo@sttexasroofing.com',
    phone: '(956) 664-8800',
    company: 'South Texas Roofing',
    trade: 'Roofing',
    rating: 4.8,
    lastContact: new Date('2025-01-27T10:00:00'),
    isFavorite: true,
    timeline: [
      { type: 'call', direction: 'outbound', date: new Date('2025-01-27T10:00:00'), duration: 312, summary: 'Confirmed roof truss delivery for Feb 3' },
      { type: 'sms', direction: 'inbound', date: new Date('2025-01-26T08:30:00'), content: 'Crew confirmed for Monday. Will arrive 7am.' },
    ],
  },
  {
    id: '5',
    name: 'James Wilson',
    type: 'lead',
    email: 'james.wilson@outlook.com',
    phone: '(956) 555-9876',
    projectType: 'Custom Home',
    location: 'McAllen',
    lastContact: new Date('2025-01-27T16:20:00'),
    timeline: [
      { type: 'voicemail', date: new Date('2025-01-27T16:20:00'), duration: 45, summary: 'Interested in building custom home in McAllen area' },
    ],
  },
];

const CONTACT_TYPES = {
  homeowner: { label: 'Homeowner', icon: Home, color: 'bg-blue-500' },
  subcontractor: { label: 'Subcontractor', icon: Briefcase, color: 'bg-purple-500' },
  lead: { label: 'Lead', icon: Users, color: 'bg-green-500' },
  vendor: { label: 'Vendor', icon: Building2, color: 'bg-orange-500' },
};

const TIMELINE_ICONS = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
  whatsapp: MessageCircle,
  portal: FileText,
  voicemail: Phone,
};

function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof DEMO_CONTACTS[0] | null>(DEMO_CONTACTS[0]);
  const [filter, setFilter] = useState<'all' | 'homeowner' | 'subcontractor' | 'lead'>('all');

  const filteredContacts = DEMO_CONTACTS.filter((contact) => {
    if (filter !== 'all' && contact.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Unified Contacts
          </h1>
          <p className="text-muted-foreground">Complete communication history in one view</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['all', 'homeowner', 'subcontractor', 'lead'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              {f === 'all' ? 'All' : CONTACT_TYPES[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">{filteredContacts.length} Contacts</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredContacts.map((contact) => {
              const TypeConfig = CONTACT_TYPES[contact.type as keyof typeof CONTACT_TYPES];
              const TypeIcon = TypeConfig?.icon || Users;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    selectedContact?.id === contact.id && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                      TypeConfig?.color
                    )}>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{contact.name}</span>
                        {contact.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {contact.company || contact.projectName || contact.projectType}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <TypeIcon className="w-3 h-3" />
                        <span>{TypeConfig?.label}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(contact.lastContact)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Detail & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold',
                      CONTACT_TYPES[selectedContact.type as keyof typeof CONTACT_TYPES]?.color
                    )}>
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                        {selectedContact.isFavorite && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {selectedContact.company && (
                        <div className="text-muted-foreground">{selectedContact.company}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                          CONTACT_TYPES[selectedContact.type as keyof typeof CONTACT_TYPES]?.color
                        )}>
                          {CONTACT_TYPES[selectedContact.type as keyof typeof CONTACT_TYPES]?.label}
                        </span>
                        {selectedContact.rating && (
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {selectedContact.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary p-2">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="btn-secondary p-2">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="btn-secondary p-2">
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{selectedContact.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium truncate">{selectedContact.email}</div>
                  </div>
                  {selectedContact.projectName && (
                    <div>
                      <div className="text-sm text-muted-foreground">Project</div>
                      <div className="font-medium truncate">{selectedContact.projectName}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Communication Timeline */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Communication Timeline</h3>
                </div>
                <div className="p-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                    {/* Timeline items */}
                    <div className="space-y-6">
                      {selectedContact.timeline.map((item, idx) => {
                        const Icon = TIMELINE_ICONS[item.type as keyof typeof TIMELINE_ICONS] || MessageSquare;
                        const isCall = item.type === 'call' || item.type === 'voicemail';
                        const direction = (item as any).direction;
                        
                        return (
                          <div key={idx} className="relative flex gap-4">
                            {/* Icon */}
                            <div className={cn(
                              'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                              item.type === 'call' && (item as any).missed ? 'bg-red-500/20 text-red-500' :
                              item.type === 'call' ? 'bg-green-500/20 text-green-500' :
                              item.type === 'sms' ? 'bg-blue-500/20 text-blue-500' :
                              item.type === 'email' ? 'bg-purple-500/20 text-purple-500' :
                              item.type === 'portal' ? 'bg-secondary/20 text-secondary' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {isCall && direction === 'inbound' ? (
                                <PhoneIncoming className="w-5 h-5" />
                              ) : isCall && direction === 'outbound' ? (
                                <PhoneOutgoing className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm capitalize">
                                    {item.type === 'portal' ? 'Client Portal' : item.type}
                                  </span>
                                  {direction && (
                                    <span className="text-xs text-muted-foreground capitalize">
                                      ({direction})
                                    </span>
                                  )}
                                  {(item as any).missed && (
                                    <span className="text-xs text-red-500">Missed</span>
                                  )}
                                  {(item as any).risk && (
                                    <span className="flex items-center gap-1 text-xs text-red-500">
                                      <AlertTriangle className="w-3 h-3" />
                                      Risk
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.date)}
                                </span>
                              </div>

                              {(item as any).summary && (
                                <p className="text-sm">{(item as any).summary}</p>
                              )}
                              {(item as any).content && (
                                <p className="text-sm">{(item as any).content}</p>
                              )}
                              {(item as any).subject && (
                                <p className="text-sm">{(item as any).subject}</p>
                              )}
                              {(item as any).action && (
                                <p className="text-sm flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  {(item as any).action}
                                </p>
                              )}

                              {(item as any).duration && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Duration: {Math.floor((item as any).duration / 60)}:{((item as any).duration % 60).toString().padStart(2, '0')}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select a contact to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
