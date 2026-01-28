import { z } from 'zod';

// =============================================================================
// Auth Validators
// =============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  tenantName: z.string().min(2, 'Company name must be at least 2 characters'),
  tenantSlug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// =============================================================================
// Tenant Validators
// =============================================================================

export const tenantUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  domain: z.string().url('Invalid domain URL').nullable().optional(),
  logo: z.string().url('Invalid logo URL').nullable().optional(),
  settings: z
    .object({
      brandColor: z.string().optional(),
      timezone: z.string().optional(),
      locale: z.string().optional(),
      dateFormat: z.string().optional(),
      currency: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// Onboarding Validators
// =============================================================================

export const onboardingCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const onboardingTeamSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email('Invalid email address'),
        role: z.enum(['admin', 'member']),
      })
    )
    .max(10, 'Maximum 10 invites at once')
    .optional(),
});

export const onboardingBrandingSchema = z.object({
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),
});

export const onboardingIntegrationsSchema = z.object({
  integrations: z.array(z.string()).optional(),
});

export const onboardingBillingSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

// =============================================================================
// Client Validators
// =============================================================================

export const clientCreateSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

// =============================================================================
// Project Validators
// =============================================================================

export const projectCreateSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  clientId: z.string().uuid('Invalid client ID').nullable().optional(),
  budget: z.string().optional(),
  currency: z.string().default('USD'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  status: z
    .enum(['draft', 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'])
    .optional(),
});

// =============================================================================
// Milestone Validators
// =============================================================================

export const milestoneCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().min(2, 'Milestone name must be at least 2 characters'),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  amount: z.string().optional(),
});

export const milestoneUpdateSchema = milestoneCreateSchema.omit({ projectId: true }).partial();

// =============================================================================
// Task Validators
// =============================================================================

export const taskCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  milestoneId: z.string().uuid('Invalid milestone ID').nullable().optional(),
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.omit({ projectId: true }).partial().extend({
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
  actualHours: z.string().optional(),
});

// =============================================================================
// Deliverable Validators
// =============================================================================

export const deliverableCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  milestoneId: z.string().uuid('Invalid milestone ID').nullable().optional(),
  name: z.string().min(2, 'Deliverable name must be at least 2 characters'),
  description: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export const deliverableUpdateSchema = deliverableCreateSchema
  .omit({ projectId: true })
  .partial()
  .extend({
    status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
    feedback: z.string().optional(),
  });

// =============================================================================
// User Validators
// =============================================================================

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').nullable().optional(),
});

export const userInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'client']),
});

// =============================================================================
// Pagination Validators
// =============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// Contact Form Validator (for landing page)
// =============================================================================

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// =============================================================================
// Type Exports
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type MilestoneCreateInput = z.infer<typeof milestoneCreateSchema>;
export type MilestoneUpdateInput = z.infer<typeof milestoneUpdateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type DeliverableCreateInput = z.infer<typeof deliverableCreateSchema>;
export type DeliverableUpdateInput = z.infer<typeof deliverableUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserInviteInput = z.infer<typeof userInviteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
