import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

// Format number with abbreviation
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

// Format date
export function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text || '';
  return `${text.substring(0, length)}...`;
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Status color mapping - Construction Domain
export const statusColors: Record<string, string> = {
  // Project statuses
  planning: 'bg-[#1e3a5f]/20 text-[#1e3a5f]',
  active: 'bg-[#e85d04]/20 text-[#e85d04]',
  on_hold: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',

  // Project phases
  pre_construction: 'bg-blue-500/20 text-blue-400',
  site_prep: 'bg-amber-600/20 text-amber-600',
  foundation: 'bg-stone-500/20 text-stone-400',
  framing: 'bg-orange-600/20 text-orange-600',
  roofing: 'bg-red-600/20 text-red-600',
  rough_in: 'bg-yellow-600/20 text-yellow-600',
  insulation: 'bg-teal-500/20 text-teal-400',
  drywall: 'bg-stone-400/20 text-stone-300',
  interior_finish: 'bg-pink-500/20 text-pink-400',
  exterior_finish: 'bg-emerald-500/20 text-emerald-400',
  final_completion: 'bg-purple-500/20 text-purple-400',
  warranty_period: 'bg-indigo-500/20 text-indigo-400',
  archived: 'bg-gray-500/20 text-gray-400',

  // Homeowner statuses
  inquiry: 'bg-blue-500/20 text-blue-400',
  contracted: 'bg-yellow-500/20 text-yellow-400',
  construction: 'bg-[#e85d04]/20 text-[#e85d04]',
  punch_list: 'bg-purple-500/20 text-purple-400',
  warranty: 'bg-indigo-500/20 text-indigo-400',

  // Task statuses
  pending: 'bg-gray-500/20 text-gray-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  inspection: 'bg-purple-500/20 text-purple-400',
  blocked: 'bg-red-500/20 text-red-500',

  // Subcontractor statuses
  preferred: 'bg-green-500/20 text-green-500',
  do_not_use: 'bg-red-500/20 text-red-500',

  // Communication statuses
  pending_follow_up: 'bg-yellow-500/20 text-yellow-400',
  urgent: 'bg-red-500/20 text-red-500',

  // Change order statuses
  draft: 'bg-gray-500/20 text-gray-400',
  pending_approval: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  implemented: 'bg-blue-500/20 text-blue-400',
  invoiced: 'bg-purple-500/20 text-purple-400',
  paid: 'bg-green-500/20 text-green-500',

  // Invoice statuses
  sent: 'bg-blue-500/20 text-blue-400',
  viewed: 'bg-yellow-500/20 text-yellow-400',
  overdue: 'bg-red-500/20 text-red-500',
  void: 'bg-gray-500/20 text-gray-400',

  // Risk severities
  info: 'bg-blue-500/20 text-blue-400',
  low: 'bg-green-500/20 text-green-500',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-500',
};

// Priority color mapping - Construction
export const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  normal: 'bg-blue-500/20 text-blue-400',
  urgent: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-500',
};

// Phase labels for display
export const phaseLabels: Record<string, string> = {
  pre_construction: 'Pre-Construction',
  site_prep: 'Site Prep',
  foundation: 'Foundation',
  framing: 'Framing',
  roofing: 'Roofing',
  rough_in: 'Rough-In',
  insulation: 'Insulation',
  drywall: 'Drywall',
  interior_finish: 'Interior Finish',
  exterior_finish: 'Exterior Finish',
  final_completion: 'Final Completion',
  warranty_period: 'Warranty Period',
  archived: 'Archived',
};

// Homeowner status labels
export const homeownerStatusLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  contracted: 'Contracted',
  construction: 'Under Construction',
  punch_list: 'Punch List',
  completed: 'Completed',
  warranty: 'Warranty Period',
};

// Trade labels
export const tradeLabels: Record<string, string> = {
  general_contractor: 'General Contractor',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  hvac: 'HVAC',
  roofing: 'Roofing',
  framing: 'Framing',
  concrete: 'Concrete',
  flooring: 'Flooring',
  painting: 'Painting',
  landscaping: 'Landscaping',
  excavation: 'Excavation',
  insulation: 'Insulation',
  drywall: 'Drywall',
  cabinets: 'Cabinets',
  countertops: 'Countertops',
  windows_doors: 'Windows & Doors',
  appliances: 'Appliances',
  cleaning: 'Cleaning',
  other: 'Other',
};
