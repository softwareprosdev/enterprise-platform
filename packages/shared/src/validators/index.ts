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
      companyAddress: z.string().optional(),
      companyPhone: z.string().optional(),
      licenseNumber: z.string().optional(),
      defaultMarkupPercent: z.number().optional(),
      warrantyPeriodMonths: z.number().optional(),
    })
    .optional(),
});

// =============================================================================
// Onboarding Validators
// =============================================================================

export const onboardingCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const onboardingTeamSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email('Invalid email address'),
        role: z.enum(['project_manager', 'office_staff', 'field_staff']),
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
// Homeowner Validators (was: Client)
// =============================================================================

export const homeownerCreateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  currentAddress: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
});

export const homeownerUpdateSchema = homeownerCreateSchema.partial().extend({
  status: z.enum(['inquiry', 'contracted', 'construction', 'punch_list', 'completed', 'warranty', 'archived']).optional(),
  contractSignedAt: z.coerce.date().optional(),
  contractAmount: z.string().optional(),
  portalEnabled: z.boolean().optional(),
  preferredContactMethod: z.enum(['phone', 'email', 'text']).optional(),
  communicationFrequency: z.enum(['daily', 'weekly', 'milestone']).optional(),
});

// =============================================================================
// Subcontractor Validators
// =============================================================================

export const subcontractorCreateSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  contactMobile: z.string().optional(),
  primaryTradeId: z.string().uuid('Invalid trade ID').optional(),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  insuranceCarrier: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceCoverageAmount: z.number().optional(),
  notes: z.string().optional(),
});

export const subcontractorUpdateSchema = subcontractorCreateSchema.partial().extend({
  status: z.enum(['active', 'preferred', 'on_hold', 'do_not_use']).optional(),
  rating: z.number().min(1).max(5).optional(),
  onTimePercentage: z.number().min(0).max(100).optional(),
  qualityScore: z.number().min(0).max(10).optional(),
});

// =============================================================================
// Trade Validators
// =============================================================================

export const tradeCreateSchema = z.object({
  name: z.string().min(2, 'Trade name must be at least 2 characters'),
  category: z.enum([
    'general_contractor',
    'electrical',
    'plumbing',
    'hvac',
    'roofing',
    'framing',
    'concrete',
    'flooring',
    'painting',
    'landscaping',
    'excavation',
    'insulation',
    'drywall',
    'cabinets',
    'countertops',
    'windows_doors',
    'appliances',
    'cleaning',
    'other',
  ]),
  description: z.string().optional(),
  typicalDurationDays: z.number().int().positive().optional(),
});

export const tradeUpdateSchema = tradeCreateSchema.partial();

// =============================================================================
// Communication Validators
// =============================================================================

export const communicationCreateSchema = z.object({
  type: z.enum([
    'call_inbound',
    'call_outbound',
    'call_missed',
    'call_voicemail',
    'sms_inbound',
    'sms_outbound',
    'email_inbound',
    'email_outbound',
  ]),
  direction: z.enum(['inbound', 'outbound']),
  fromNumber: z.string().optional(),
  toNumber: z.string().optional(),
  fromEmail: z.string().optional(),
  toEmail: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  recordingUrl: z.string().optional(),
  durationSeconds: z.number().optional(),
  mediaUrls: z.array(z.string()).optional(),
  projectId: z.string().uuid().optional(),
  homeownerId: z.string().uuid().optional(),
  subcontractorId: z.string().uuid().optional(),
});

export const communicationUpdateSchema = z.object({
  status: z.enum(['completed', 'pending_follow_up', 'urgent', 'archived']).optional(),
  aiSummary: z.string().optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  detectedRisk: z.boolean().optional(),
  riskSeverity: z.enum(['info', 'low', 'medium', 'high', 'critical']).optional(),
  actionItems: z.array(z.string()).optional(),
  requiresFollowUp: z.boolean().optional(),
  followUpDate: z.coerce.date().optional(),
  followedUpAt: z.coerce.date().optional(),
  isVoicemail: z.boolean().optional(),
  voicemailTranscript: z.string().optional(),
});

// =============================================================================
// Project Validators (Construction-focused)
// =============================================================================

export const projectCreateSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  projectNumber: z.string().optional(),
  description: z.string().optional(),
  homeownerId: z.string().uuid('Invalid homeowner ID').nullable().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  lotNumber: z.string().optional(),
  subdivision: z.string().optional(),
  contractAmount: z.number().positive().optional(),
  estimatedStartDate: z.coerce.date().optional(),
  estimatedCompletionDate: z.coerce.date().optional(),
  squareFootage: z.number().int().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().positive().optional(),
  stories: z.number().int().positive().optional(),
  garageSpaces: z.number().int().positive().optional(),
  permitNumber: z.string().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  currentPhase: z.enum([
    'pre_construction',
    'site_prep',
    'foundation',
    'framing',
    'roofing',
    'rough_in',
    'insulation',
    'drywall',
    'interior_finish',
    'exterior_finish',
    'final_completion',
    'warranty_period',
    'archived',
  ]).optional(),
  actualStartDate: z.coerce.date().optional(),
  actualCompletionDate: z.coerce.date().optional(),
  budgetTotal: z.number().optional(),
  totalSpent: z.number().optional(),
  totalInvoiced: z.number().optional(),
  totalPaid: z.number().optional(),
});

// =============================================================================
// Project Phase Validators
// =============================================================================

export const projectPhaseUpdateSchema = z.object({
  estimatedStartDate: z.coerce.date().optional(),
  estimatedEndDate: z.coerce.date().optional(),
  actualStartDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  estimatedDurationDays: z.number().int().positive().optional(),
  actualDurationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

// =============================================================================
// Task Validators (Construction-focused)
// =============================================================================

export const taskCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  projectPhaseId: z.string().uuid('Invalid phase ID').optional(),
  tradeId: z.string().uuid('Invalid trade ID').optional(),
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  assignedToId: z.string().uuid('Invalid assignee ID').optional(),
  assignedSubcontractorId: z.string().uuid('Invalid subcontractor ID').optional(),
  priority: z.enum(['low', 'normal', 'urgent', 'critical']).default('normal'),
  scheduledDate: z.coerce.date().optional(),
  estimatedHours: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  requiresInspection: z.boolean().default(false),
  poNumber: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.omit({ projectId: true }).partial().extend({
  status: z.enum(['pending', 'scheduled', 'in_progress', 'inspection', 'completed', 'blocked']).optional(),
  actualCost: z.number().optional(),
  actualHours: z.string().optional(),
  inspectionStatus: z.enum(['scheduled', 'passed', 'failed']).optional(),
  inspectionDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

// =============================================================================
// Change Order Validators
// =============================================================================

export const changeOrderCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  coNumber: z.string().min(1, 'Change order number is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  requestedBy: z.enum(['homeowner', 'villa', 'subcontractor']),
  requestedByHomeownerId: z.string().uuid().optional(),
  requestedBySubcontractorId: z.string().uuid().optional(),
  costImpact: z.number().default(0),
  scheduleImpactDays: z.number().int().default(0),
  photos: z.array(z.string()).optional(),
});

export const changeOrderUpdateSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'implemented', 'invoiced', 'paid']).optional(),
  submittedAt: z.coerce.date().optional(),
  approvedAt: z.coerce.date().optional(),
  homeownerApprovedAt: z.coerce.date().optional(),
  homeownerSignature: z.string().optional(),
  rejectedAt: z.coerce.date().optional(),
  rejectionReason: z.string().optional(),
  implementedAt: z.coerce.date().optional(),
  invoicedAt: z.coerce.date().optional(),
});

// =============================================================================
// Budget Line Item Validators
// =============================================================================

export const budgetLineItemCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  category: z.enum([
    'land_cost',
    'permits_fees',
    'site_prep',
    'foundation',
    'framing',
    'roofing',
    'exterior',
    'mechanical',
    'electrical',
    'insulation',
    'drywall',
    'interior_finish',
    'flooring',
    'appliances',
    'landscaping',
    'contingency',
    'overhead',
    'profit',
  ]),
  description: z.string().min(2, 'Description is required'),
  tradeId: z.string().uuid().optional(),
  estimatedAmount: z.number().positive(),
  isAllowance: z.boolean().default(false),
  isContingency: z.boolean().default(false),
});

export const budgetLineItemUpdateSchema = budgetLineItemCreateSchema.omit({ projectId: true }).partial().extend({
  actualAmount: z.number().optional(),
  committedAmount: z.number().optional(),
  subcontractorId: z.string().uuid().optional(),
  poNumber: z.string().optional(),
  poIssuedAt: z.coerce.date().optional(),
});

// =============================================================================
// Daily Log Validators
// =============================================================================

export const dailyLogCreateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  logDate: z.coerce.date(),
  weatherCondition: z.enum(['sunny', 'cloudy', 'rain', 'snow', 'windy', 'extreme_heat', 'extreme_cold']).optional(),
  temperatureHigh: z.number().int().optional(),
  temperatureLow: z.number().int().optional(),
  precipitation: z.string().optional(),
  windSpeed: z.number().int().optional(),
  workSummary: z.string().min(5, 'Work summary is required'),
  crewCount: z.number().int().positive().optional(),
  crewNames: z.string().optional(),
  hoursWorked: z.string().optional(),
  subsOnSite: z.array(z.object({
    subcontractorId: z.string(),
    trade: z.string(),
    crewSize: z.number(),
  })).optional(),
  equipmentUsed: z.array(z.string()).optional(),
  safetyNotes: z.string().optional(),
  incidents: z.string().optional(),
  safetyMeetingHeld: z.boolean().default(false),
  delays: z.string().optional(),
  delayReason: z.enum(['weather', 'materials', 'inspection', 'sub', 'other']).optional(),
  inspectorVisit: z.boolean().default(false),
  inspectorNotes: z.string().optional(),
  homeownerVisit: z.boolean().default(false),
  materialsDelivered: z.string().optional(),
});

export const dailyLogUpdateSchema = dailyLogCreateSchema.omit({ projectId: true }).partial();

// =============================================================================
// User Validators
// =============================================================================

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').nullable().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.enum(['field_operations', 'office']).optional(),
  canReceiveCalls: z.boolean().optional(),
  extension: z.string().optional(),
});

export const userInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['project_manager', 'office_staff', 'field_staff']),
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
export type HomeownerCreateInput = z.infer<typeof homeownerCreateSchema>;
export type HomeownerUpdateInput = z.infer<typeof homeownerUpdateSchema>;
export type SubcontractorCreateInput = z.infer<typeof subcontractorCreateSchema>;
export type SubcontractorUpdateInput = z.infer<typeof subcontractorUpdateSchema>;
export type TradeCreateInput = z.infer<typeof tradeCreateSchema>;
export type TradeUpdateInput = z.infer<typeof tradeUpdateSchema>;
export type CommunicationCreateInput = z.infer<typeof communicationCreateSchema>;
export type CommunicationUpdateInput = z.infer<typeof communicationUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectPhaseUpdateInput = z.infer<typeof projectPhaseUpdateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type ChangeOrderCreateInput = z.infer<typeof changeOrderCreateSchema>;
export type ChangeOrderUpdateInput = z.infer<typeof changeOrderUpdateSchema>;
export type BudgetLineItemCreateInput = z.infer<typeof budgetLineItemCreateSchema>;
export type BudgetLineItemUpdateInput = z.infer<typeof budgetLineItemUpdateSchema>;
export type DailyLogCreateInput = z.infer<typeof dailyLogCreateSchema>;
export type DailyLogUpdateInput = z.infer<typeof dailyLogUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserInviteInput = z.infer<typeof userInviteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
