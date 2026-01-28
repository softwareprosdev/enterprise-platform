import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
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
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Status color mapping
export const statusColors: Record<string, string> = {
  // Project statuses
  draft: 'bg-muted text-muted-foreground',
  planning: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  review: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-success/20 text-success',
  on_hold: 'bg-orange-500/20 text-orange-400',
  cancelled: 'bg-destructive/20 text-destructive',

  // Task statuses
  backlog: 'bg-muted text-muted-foreground',
  todo: 'bg-blue-500/20 text-blue-400',
  in_review: 'bg-purple-500/20 text-purple-400',
  done: 'bg-success/20 text-success',

  // Client statuses
  lead: 'bg-muted text-muted-foreground',
  prospect: 'bg-blue-500/20 text-blue-400',
  onboarding: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-success/20 text-success',
  churned: 'bg-destructive/20 text-destructive',

  // Generic
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-success/20 text-success',
};

// Priority color mapping
export const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-destructive/20 text-destructive',
};
