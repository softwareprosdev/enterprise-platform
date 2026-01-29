import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

interface AIAction {
  type: 'task_created' | 'call_scheduled' | 'report_generated' | 'alert_acknowledged';
  description: string;
  entityId?: string;
  entityType?: string;
}

const SAMPLE_SUGGESTIONS = [
  "What's the status on the Johnson project?",
  "Which projects are at risk this week?",
  "Schedule a site visit with ABC Plumbing",
  "How much have we spent on lumber this month?",
  "Show me today's priorities",
  "What calls do I have scheduled?",
];

export function VillaAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Villa AI, your construction intelligence assistant. Ask me anything about your projects, schedule calls, check budgets, or get risk alerts. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(input);
      setMessages((prev) => [...prev, response]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let content = '';
    let actions: AIAction[] = [];

    if (lowerQuery.includes('status') && lowerQuery.includes('johnson')) {
      content = `**Johnson Residence - Belmont Ridge**\n\n📍 **Current Phase:** Framing (65% complete)\n📅 **Timeline:** On track for June 15 completion\n💰 **Budget:** $142,500 spent of $385,000 (37%)\n\n**Recent Activity:**\n• Framing crew completed second floor walls yesterday\n• Roof trusses scheduled for delivery Feb 3\n• Plumbing rough-in inspection passed\n\n⚠️ **1 Risk Alert:** Weather forecast shows rain next week - may delay roofing by 2-3 days.`;
    } else if (lowerQuery.includes('risk') || lowerQuery.includes('at risk')) {
      content = `**Projects at Risk This Week:**\n\n🔴 **Madeira Phase 1** - HIGH RISK\n• 12 days behind schedule\n• Permit delays + weather impact\n• Recommended: Add second framing crew\n\n🟡 **Trevino Residence** - MEDIUM RISK\n• Plumbing inspection rescheduled twice\n• Sub communication issues\n• Recommended: Call Valley Plumbing today\n\n🟢 **All other projects on track**`;
      actions = [
        { type: 'alert_acknowledged', description: 'Risk alerts reviewed' },
      ];
    } else if (lowerQuery.includes('schedule') && (lowerQuery.includes('visit') || lowerQuery.includes('meeting'))) {
      content = `I'll schedule that for you. When would you like to meet?\n\n**Available slots this week:**\n• Tomorrow (Wed) - 10:00 AM, 2:00 PM\n• Thursday - 9:00 AM, 11:00 AM, 3:00 PM\n• Friday - 10:00 AM, 1:00 PM\n\nJust say the time and I'll send the calendar invite and notify the subcontractor.`;
    } else if (lowerQuery.includes('lumber') || lowerQuery.includes('spent')) {
      content = `**Lumber Spending - January 2025**\n\n💰 **Total:** $47,832\n📈 **vs Last Month:** +12% ($5,200 more)\n\n**By Project:**\n• Madeira Phase 1: $28,500\n• Gonzalez Residence: $12,400\n• Trevino Residence: $6,932\n\n📊 **Market Note:** Lumber prices up 8% this month. Consider locking in pricing for Q2 projects.`;
    } else if (lowerQuery.includes('priorities') || lowerQuery.includes('today')) {
      content = `**Today's Priorities - January 29, 2025**\n\n🔴 **Urgent:**\n1. Call Valley Plumbing re: inspection reschedule\n2. Review Madeira change order #3 ($45K)\n\n🟡 **Important:**\n3. Gonzalez framing walkthrough at 2 PM\n4. Submit Trevino progress draw ($85K)\n5. Review 3 new lead inquiries\n\n📞 **Scheduled Calls:**\n• 10:00 AM - Mike Johnson (project update)\n• 3:00 PM - ABC Electric (quote review)\n\n📍 **Site Visits:**\n• 2:00 PM - Gonzalez Residence`;
    } else if (lowerQuery.includes('call')) {
      content = `**Upcoming Calls:**\n\n📞 **Today:**\n• 10:00 AM - Mike Johnson (Homeowner) - Project update\n• 3:00 PM - ABC Electric - Quote review\n\n📞 **Tomorrow:**\n• 9:00 AM - Valley Plumbing - Inspection coordination\n• 2:00 PM - New lead: Sarah Williams\n\nWould you like me to dial any of these now, or schedule a new call?`;
    } else {
      content = `I understand you're asking about "${query}". Let me help you with that.\n\nHere's what I can do:\n• 📊 Check project status and budgets\n• 📞 Schedule calls and meetings\n• ⚠️ Review risk alerts\n• 📈 Generate reports\n• ✅ Create tasks\n\nCould you be more specific about what you need?`;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      actions,
    };
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setInput("What's the status on the Johnson project?");
        setIsListening(false);
      }, 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-50"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300',
        isMinimized
          ? 'bottom-6 right-6 w-80 h-14'
          : 'bottom-6 right-6 w-[420px] h-[600px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary to-primary/90 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <div className="font-semibold flex items-center gap-2">
              Villa AI
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-xs text-white/70">Your construction assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      {message.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {action.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SUGGESTIONS.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={cn(
                  'p-3 rounded-xl transition-colors',
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? 'Listening...' : 'Ask Villa anything...'}
                className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isListening}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VillaAIAssistant;
