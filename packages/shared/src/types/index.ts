// =============================================================================
// Core Types
// =============================================================================

export type TenantStatus = 'active' | 'suspended' | 'cancelled' | 'trial';
export type UserRole = 'owner' | 'admin' | 'member' | 'client';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type ClientStatus = 'lead' | 'prospect' | 'onboarding' | 'active' | 'completed' | 'churned';
export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'on_hold'
  | 'cancelled';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'paid';
export type DeliverableStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void';
export type OnboardingStep =
  | 'company'
  | 'team'
  | 'branding'
  | 'integrations'
  | 'billing'
  | 'complete';

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// Entity Types
// =============================================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
  settings: TenantSettings;
  plan: string;
  status: TenantStatus;
  onboardingStep: OnboardingStep;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  brandColor?: string;
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  currency?: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  tenantId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  tenantId: string;
  clientId: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: string | null;
  currency: string;
  startDate: Date | null;
  endDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  dueDate: Date | null;
  amount: string | null;
  status: MilestoneStatus;
  completedAt: Date | null;
  paidAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string | null;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedHours: string | null;
  actualHours: string | null;
  sortOrder: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  projectId: string;
  milestoneId: string | null;
  name: string;
  description: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  status: DeliverableStatus;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  stripePriceId: string | null;
  price: string;
  currency: string;
  interval: string;
  features: string[];
  limits: PlanLimits;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface PlanLimits {
  projects: number;
  teamMembers: number;
  clients: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelledAt: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  stripeInvoiceId: string | null;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  invoiceUrl: string | null;
  pdfUrl: string | null;
  paidAt: Date | null;
  dueDate: Date | null;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// =============================================================================
// Auth Types
// =============================================================================

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  mfaEnabled: boolean;
}

export interface AuthSession {
  user: AuthUser;
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'plan' | 'status'>;
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  revenue: number;
  pendingPayments: number;
}

export interface DashboardActivity {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  userName: string;
  createdAt: Date;
}

export interface ProjectWithClient extends Project {
  client: Pick<Client, 'id' | 'companyName'> | null;
}

export interface TaskWithAssignee extends Task {
  assignee: Pick<User, 'id' | 'name' | 'avatar'> | null;
}
