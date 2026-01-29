import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// =============================================================================
// Enums - Construction Domain Specific
// =============================================================================

// User roles for construction company staff
export const userRoleEnum = pgEnum('user_role', [
  'owner',           // Company owner
  'project_manager', // Project manager
  'office_staff',    // Office/admin staff
  'field_staff',     // Supervisors, leads
  'client',          // Homeowner portal access
]);

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending']);

// Homeowner lifecycle (was: client_status)
export const homeownerStatusEnum = pgEnum('homeowner_status', [
  'inquiry',      // Initial contact, pre-contract
  'contracted',   // Signed contract, pre-construction
  'construction', // Active build
  'punch_list',   // Final completion items
  'completed',    // Build finished
  'warranty',     // Under warranty period
  'archived',     // Past client
]);

// Custom home project phases (was: project_status)
export const projectPhaseEnum = pgEnum('project_phase', [
  'pre_construction', // Permits, planning, selections
  'site_prep',        // Excavation, foundation prep
  'foundation',       // Concrete, basement
  'framing',          // Structural framing
  'roofing',          // Roof structure and cover
  'rough_in',         // Electrical, plumbing, HVAC rough
  'insulation',       // Insulation and weatherization
  'drywall',          // Drywall installation
  'interior_finish',  // Paint, flooring, cabinets
  'exterior_finish',  // Siding, landscaping
  'final_completion', // Final inspections, punch list
  'warranty_period',  // Post-completion warranty
  'archived',         // Project closed
]);

export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);

// Construction task status
export const taskStatusEnum = pgEnum('task_status', [
  'pending',      // Not started
  'scheduled',    // Scheduled with date
  'in_progress',  // Work started
  'inspection',   // Pending inspection
  'completed',    // Done
  'blocked',      // Blocked by dependency
]);

export const taskPriorityEnum = pgEnum('task_priority', ['low', 'normal', 'urgent', 'critical']);

// Trade categories for subcontractors
export const tradeEnum = pgEnum('trade', [
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
]);

// Subcontractor status
export const subcontractorStatusEnum = pgEnum('subcontractor_status', [
  'active',      // Currently working with
  'preferred',   // Go-to subs
  'on_hold',     // Temporary issues
  'do_not_use',  // Blacklisted
]);

// Communication types - calls are first-class data
export const communicationTypeEnum = pgEnum('communication_type', [
  'call_inbound',     // Received call
  'call_outbound',    // Made call
  'call_missed',      // Missed call
  'call_voicemail',   // Voicemail left/received
  'sms_inbound',      // Received text
  'sms_outbound',     // Sent text
  'email_inbound',    // Received email
  'email_outbound',   // Sent email
]);

export const communicationStatusEnum = pgEnum('communication_status', [
  'completed',
  'pending_follow_up',
  'urgent',
  'archived',
]);

// Risk severity for AI-detected issues
export const riskSeverityEnum = pgEnum('risk_severity', [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

// Change order status
export const changeOrderStatusEnum = pgEnum('change_order_status', [
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'implemented',
  'invoiced',
  'paid',
]);

// Budget line item categories
export const budgetCategoryEnum = pgEnum('budget_category', [
  'land_cost',
  'permits_fees',
  'site_prep',
  'foundation',
  'framing',
  'roofing',
  'exterior',
  'mechanical',    // HVAC, plumbing rough
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
]);

// Invoice types for construction billing
export const invoiceTypeEnum = pgEnum('invoice_type', [
  'deposit',           // Initial deposit
  'progress_draw',     // Progress billing
  'change_order',      // Change order billing
  'final_payment',     // Final payment
  'warranty_claim',    // Warranty work billing
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'viewed',
  'approved',
  'paid',
  'overdue',
  'void',
]);

// Document types for construction files
export const documentTypeEnum = pgEnum('document_type', [
  'contract',
  'plan_drawing',
  'permit',
  'inspection_report',
  'change_order',
  'invoice',
  'receipt',
  'warranty',
  'certificate_insurance',
  'photo',
  'selection_sheet',
  'other',
]);

// Equipment status
export const equipmentStatusEnum = pgEnum('equipment_status', [
  'available',
  'in_use',
  'maintenance',
  'lost',
  'retired',
]);

// Daily log weather conditions
export const weatherConditionEnum = pgEnum('weather_condition', [
  'sunny',
  'cloudy',
  'rain',
  'snow',
  'windy',
  'extreme_heat',
  'extreme_cold',
]);

// =============================================================================
// Villa Homes (Single Tenant Configuration)
// =============================================================================

// Keep tenants table for future expansion but lock to Villa Homes
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().default('Villa Homes'),
    slug: text('slug').notNull().unique().default('villa-homes'),
    settings: jsonb('settings').default({
      companyAddress: null,
      companyPhone: null,
      licenseNumber: null,
      defaultMarkupPercent: 20,
      warrantyPeriodMonths: 12,
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('tenants_slug_idx').on(table.slug)]
);

// =============================================================================
// Users (Villa Homes Staff + Homeowner Portal Access)
// =============================================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    name: text('name').notNull(),
    avatar: text('avatar'),
    role: userRoleEnum('role').default('field_staff').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    // MFA for staff security
    mfaSecret: text('mfa_secret'),
    mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
    backupCodes: jsonb('backup_codes').default([]),
    // Profile fields
    phone: text('phone'),
    title: text('title'), // Job title
    department: text('department'), // e.g., 'field_operations', 'office'
    // For field staff
    canReceiveCalls: boolean('can_receive_calls').default(false),
    extension: text('extension'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    emailVerified: boolean('email_verified').default(false).notNull(),
  },
  (table) => [
    uniqueIndex('users_tenant_email_idx').on(table.tenantId, table.email),
    index('users_tenant_idx').on(table.tenantId),
    index('users_role_idx').on(table.role),
  ]
);

// =============================================================================
// Sessions & Auth (Unchanged - Core Infrastructure)
// =============================================================================

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('sessions_user_idx').on(table.userId)]
);

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('oauth_provider_account_idx').on(table.provider, table.providerAccountId),
    index('oauth_user_idx').on(table.userId),
  ]
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    type: text('type').notNull(), // 'email' | 'password_reset' | 'mfa'
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('verification_tokens_user_idx').on(table.userId)]
);

// =============================================================================
// Homeowners (was: Clients - Now represents home buyers)
// =============================================================================

export const homeowners = pgTable(
  'homeowners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    // Primary contact
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    mobilePhone: text('mobile_phone'), // For SMS
    // Current address (while building)
    currentAddress: text('current_address'),
    // Portal access
    portalEnabled: boolean('portal_enabled').default(false).notNull(),
    portalPasswordHash: text('portal_password_hash'),
    portalLastLoginAt: timestamp('portal_last_login_at', { withTimezone: true }),
    // Homeowner lifecycle
    status: homeownerStatusEnum('status').default('inquiry').notNull(),
    // Contract info
    contractSignedAt: timestamp('contract_signed_at', { withTimezone: true }),
    contractAmount: decimal('contract_amount', { precision: 12, scale: 2 }),
    // Lead source tracking
    leadSource: text('lead_source'), // 'referral', 'website', 'showroom', etc.
    referredBy: text('referred_by'),
    // Notes
    notes: text('notes'),
    // Preferences/communication style
    preferredContactMethod: text('preferred_contact_method').default('phone'), // 'phone', 'email', 'text'
    communicationFrequency: text('communication_frequency').default('weekly'), // 'daily', 'weekly', 'milestone'
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('homeowners_tenant_idx').on(table.tenantId),
    index('homeowners_status_idx').on(table.status),
    index('homeowners_email_idx').on(table.email),
  ]
);

// Additional homeowner contacts (spouse, family members)
export const homeownerContacts = pgTable(
  'homeowner_contacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    homeownerId: uuid('homeowner_id')
      .notNull()
      .references(() => homeowners.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    relationship: text('relationship'), // 'spouse', 'child', 'parent', etc.
    email: text('email'),
    phone: text('phone'),
    canReceiveUpdates: boolean('can_receive_updates').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('homeowner_contacts_homeowner_idx').on(table.homeownerId)]
);

// =============================================================================
// Trades (Construction Trade Categories)
// =============================================================================

export const trades = pgTable(
  'trades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., 'Electrical', 'Plumbing'
    category: tradeEnum('category').notNull(),
    description: text('description'),
    typicalDurationDays: integer('typical_duration_days'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('trades_tenant_idx').on(table.tenantId),
    index('trades_category_idx').on(table.category),
  ]
);

// =============================================================================
// Subcontractors (Vendors/Trade Partners)
// =============================================================================

export const subcontractors = pgTable(
  'subcontractors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    // Company info
    companyName: text('company_name').notNull(),
    licenseNumber: text('license_number'),
    licenseExpiry: timestamp('license_expiry', { withTimezone: true }),
    // Primary contact
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email').notNull(),
    contactPhone: text('contact_phone'),
    contactMobile: text('contact_mobile'), // For SMS
    // Trade specialty
    primaryTradeId: uuid('primary_trade_id').references(() => trades.id),
    // Address
    address: text('address'),
    city: text('city'),
    state: text('state'),
    zipCode: text('zip_code'),
    // Insurance
    insuranceCarrier: text('insurance_carrier'),
    insurancePolicyNumber: text('insurance_policy_number'),
    insuranceExpiry: timestamp('insurance_expiry', { withTimezone: true }),
    insuranceCoverageAmount: decimal('insurance_coverage_amount', { precision: 12, scale: 2 }),
    // Performance tracking
    status: subcontractorStatusEnum('status').default('active').notNull(),
    rating: decimal('rating', { precision: 2, scale: 1 }), // 1-5 stars
    onTimePercentage: integer('on_time_percentage'), // 0-100
    qualityScore: decimal('quality_score', { precision: 3, scale: 1 }), // 0-10
    totalProjectsCompleted: integer('total_projects_completed').default(0),
    // Notes
    notes: text('notes'),
    // Communication preferences
    preferredContactMethod: text('preferred_contact_method').default('phone'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('subcontractors_tenant_idx').on(table.tenantId),
    index('subcontractors_status_idx').on(table.status),
    index('subcontractors_trade_idx').on(table.primaryTradeId),
    index('subcontractors_insurance_idx').on(table.insuranceExpiry),
  ]
);

// Subcontractor trade associations (subs can have multiple trades)
export const subcontractorTrades = pgTable(
  'subcontractor_trades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subcontractorId: uuid('subcontractor_id')
      .notNull()
      .references(() => subcontractors.id, { onDelete: 'cascade' }),
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('subcontractor_trade_unique_idx').on(table.subcontractorId, table.tradeId),
    index('subcontractor_trades_sub_idx').on(table.subcontractorId),
  ]
);

// =============================================================================
// Projects (Custom Home Builds)
// =============================================================================

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    homeownerId: uuid('homeowner_id')
      .references(() => homeowners.id, { onDelete: 'set null' }),
    // Project identification
    projectNumber: text('project_number').notNull().unique(), // e.g., "VH-2026-001"
    name: text('name').notNull(), // e.g., "Johnson Residence"
    description: text('description'),
    // Location
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    lotNumber: text('lot_number'),
    subdivision: text('subdivision'),
    // Project status
    status: projectStatusEnum('status').default('planning').notNull(),
    currentPhase: projectPhaseEnum('current_phase').default('pre_construction'),
    // Timeline
    contractDate: timestamp('contract_date', { withTimezone: true }),
    estimatedStartDate: timestamp('estimated_start_date', { withTimezone: true }),
    estimatedCompletionDate: timestamp('estimated_completion_date', { withTimezone: true }),
    actualStartDate: timestamp('actual_start_date', { withTimezone: true }),
    actualCompletionDate: timestamp('actual_completion_date', { withTimezone: true }),
    // Financial summary (denormalized for quick access)
    contractAmount: decimal('contract_amount', { precision: 12, scale: 2 }),
    budgetTotal: decimal('budget_total', { precision: 12, scale: 2 }),
    totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
    totalInvoiced: decimal('total_invoiced', { precision: 12, scale: 2 }).default('0'),
    totalPaid: decimal('total_paid', { precision: 12, scale: 2 }).default('0'),
    // Project manager assignment
    projectManagerId: uuid('project_manager_id').references(() => users.id),
    // Home specs
    squareFootage: integer('square_footage'),
    bedrooms: integer('bedrooms'),
    bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }),
    stories: integer('stories'),
    garageSpaces: integer('garage_spaces'),
    // Permit info
    permitNumber: text('permit_number'),
    permitIssueDate: timestamp('permit_issue_date', { withTimezone: true }),
    // Metadata
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('projects_tenant_idx').on(table.tenantId),
    index('projects_homeowner_idx').on(table.homeownerId),
    index('projects_status_idx').on(table.status),
    index('projects_phase_idx').on(table.currentPhase),
    index('projects_pm_idx').on(table.projectManagerId),
    uniqueIndex('projects_number_idx').on(table.projectNumber),
  ]
);

// =============================================================================
// Project Phases (Construction Schedule)
// =============================================================================

export const projectPhases = pgTable(
  'project_phases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phase: projectPhaseEnum('phase').notNull(),
    // Scheduling
    estimatedStartDate: timestamp('estimated_start_date', { withTimezone: true }),
    estimatedEndDate: timestamp('estimated_end_date', { withTimezone: true }),
    actualStartDate: timestamp('actual_start_date', { withTimezone: true }),
    actualEndDate: timestamp('actual_end_date', { withTimezone: true }),
    // Duration tracking
    estimatedDurationDays: integer('estimated_duration_days'),
    actualDurationDays: integer('actual_duration_days'),
    // Status
    isActive: boolean('is_active').default(false).notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by').references(() => users.id),
    // Notes
    notes: text('notes'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('phases_project_idx').on(table.projectId),
    index('phases_phase_idx').on(table.phase),
    uniqueIndex('phases_project_phase_unique_idx').on(table.projectId, table.phase),
  ]
);

// =============================================================================
// Tasks (Phase-Based Construction Tasks)
// =============================================================================

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    projectPhaseId: uuid('project_phase_id').references(() => projectPhases.id),
    // Task details
    title: text('title').notNull(),
    description: text('description'),
    // Assignment
    tradeId: uuid('trade_id').references(() => trades.id),
    assignedToId: uuid('assigned_to_id').references(() => users.id), // Villa staff
    assignedSubcontractorId: uuid('assigned_subcontractor_id').references(() => subcontractors.id),
    // Status
    status: taskStatusEnum('status').default('pending').notNull(),
    priority: taskPriorityEnum('priority').default('normal').notNull(),
    // Scheduling
    scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
    estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
    // Dependencies
    blockedByTaskId: uuid('blocked_by_task_id'), // Self-referential
    // Completion
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by').references(() => users.id),
    // Budget/PO info
    estimatedCost: decimal('estimated_cost', { precision: 12, scale: 2 }),
    actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
    poNumber: text('po_number'),
    // Inspection info
    requiresInspection: boolean('requires_inspection').default(false).notNull(),
    inspectionStatus: text('inspection_status'), // 'scheduled', 'passed', 'failed'
    inspectionDate: timestamp('inspection_date', { withTimezone: true }),
    // Sorting
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tasks_project_idx').on(table.projectId),
    index('tasks_phase_idx').on(table.projectPhaseId),
    index('tasks_trade_idx').on(table.tradeId),
    index('tasks_status_idx').on(table.status),
    index('tasks_assigned_sub_idx').on(table.assignedSubcontractorId),
    index('tasks_scheduled_date_idx').on(table.scheduledDate),
  ]
);

// =============================================================================
// Communications (Calls, SMS, Email - First Class Data)
// =============================================================================

export const communications = pgTable(
  'communications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    // Communication details
    type: communicationTypeEnum('type').notNull(),
    status: communicationStatusEnum('status').default('completed').notNull(),
    // Participants
    direction: text('direction').notNull(), // 'inbound', 'outbound'
    fromNumber: text('from_number'), // For calls/SMS
    toNumber: text('to_number'),
    fromEmail: text('from_email'), // For email
    toEmail: text('to_email'),
    // Linked records (polymorphic)
    projectId: uuid('project_id').references(() => projects.id),
    homeownerId: uuid('homeowner_id').references(() => homeowners.id),
    subcontractorId: uuid('subcontractor_id').references(() => subcontractors.id),
    // Content
    subject: text('subject'), // For email/call notes
    body: text('body'),
    recordingUrl: text('recording_url'), // Call recording
    durationSeconds: integer('duration_seconds'),
    // Media attachments (SMS photos, etc.)
    mediaUrls: jsonb('media_urls').default([]),
    // AI Analysis
    aiSummary: text('ai_summary'), // GPT-generated summary
    sentimentScore: decimal('sentiment_score', { precision: 3, scale: 2 }), // -1.0 to 1.0
    detectedRisk: boolean('detected_risk').default(false),
    riskSeverity: riskSeverityEnum('risk_severity'),
    actionItems: jsonb('action_items').default([]), // Extracted tasks
    // Follow-up
    requiresFollowUp: boolean('requires_follow_up').default(false),
    followUpDate: timestamp('follow_up_date', { withTimezone: true }),
    followedUpAt: timestamp('followed_up_at', { withTimezone: true }),
    // Voicemail specific
    isVoicemail: boolean('is_voicemail').default(false),
    voicemailTranscript: text('voicemail_transcript'),
    // Provider info (Twilio, etc.)
    provider: text('provider').default('twilio'),
    providerSid: text('provider_sid'), // Twilio CallSid/MessageSid
    // Timestamps
    startedAt: timestamp('started_at', { withTimezone: true }),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('communications_tenant_idx').on(table.tenantId),
    index('communications_project_idx').on(table.projectId),
    index('communications_homeowner_idx').on(table.homeownerId),
    index('communications_sub_idx').on(table.subcontractorId),
    index('communications_type_idx').on(table.type),
    index('communications_status_idx').on(table.status),
    index('communications_created_idx').on(table.createdAt),
    index('communications_follow_up_idx').on(table.followUpDate),
    index('communications_risk_idx').on(table.detectedRisk),
  ]
);

// Real-time call transcriptions
export const callTranscriptions = pgTable(
  'call_transcriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    communicationId: uuid('communication_id')
      .notNull()
      .references(() => communications.id, { onDelete: 'cascade' }),
    // Speaker identification
    speaker: text('speaker').notNull(), // 'agent', 'customer', 'subcontractor', etc.
    // Transcription segment
    text: text('text').notNull(),
    confidence: decimal('confidence', { precision: 4, scale: 3 }), // 0.0 to 1.0
    // Timing
    startTimeSeconds: decimal('start_time_seconds', { precision: 8, scale: 2 }),
    endTimeSeconds: decimal('end_time_seconds', { precision: 8, scale: 2 }),
    // Sentiment at this moment
    sentiment: text('sentiment'), // 'positive', 'neutral', 'negative'
    // Keywords detected
    keywords: jsonb('keywords').default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('transcriptions_communication_idx').on(table.communicationId),
    index('transcriptions_time_idx').on(table.startTimeSeconds),
  ]
);

// =============================================================================
// Change Orders
// =============================================================================

export const changeOrders = pgTable(
  'change_orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    // Identification
    coNumber: text('co_number').notNull(), // e.g., "CO-001"
    title: text('title').notNull(),
    description: text('description').notNull(),
    // Origin
    requestedBy: text('requested_by').notNull(), // 'homeowner', 'villa', 'subcontractor'
    requestedByHomeownerId: uuid('requested_by_homeowner_id').references(() => homeowners.id),
    requestedBySubcontractorId: uuid('requested_by_subcontractor_id').references(() => subcontractors.id),
    // Impact
    costImpact: decimal('cost_impact', { precision: 12, scale: 2 }).default('0'),
    scheduleImpactDays: integer('schedule_impact_days').default(0),
    // Status workflow
    status: changeOrderStatusEnum('status').default('draft').notNull(),
    // Approval
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    submittedBy: uuid('submitted_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: uuid('approved_by').references(() => users.id),
    homeownerApprovedAt: timestamp('homeowner_approved_at', { withTimezone: true }),
    homeownerSignature: text('homeowner_signature'), // Base64 signature image
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    // Implementation
    implementedAt: timestamp('implemented_at', { withTimezone: true }),
    // Billing
    invoicedAt: timestamp('invoiced_at', { withTimezone: true }),
    invoiceId: uuid('invoice_id'), // Link to invoice when generated
    // Photos/documentation
    photos: jsonb('photos').default([]),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('change_orders_project_idx').on(table.projectId),
    index('change_orders_status_idx').on(table.status),
    uniqueIndex('change_orders_number_idx').on(table.projectId, table.coNumber),
  ]
);

// =============================================================================
// Budget Line Items (Detailed Construction Budget)
// =============================================================================

export const budgetLineItems = pgTable(
  'budget_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    // Line item details
    category: budgetCategoryEnum('category').notNull(),
    description: text('description').notNull(),
    tradeId: uuid('trade_id').references(() => trades.id),
    // Budget amounts
    estimatedAmount: decimal('estimated_amount', { precision: 12, scale: 2 }).notNull(),
    actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }).default('0'),
    committedAmount: decimal('committed_amount', { precision: 12, scale: 2 }).default('0'), // POs issued
    // Variance tracking
    varianceAmount: decimal('variance_amount', { precision: 12, scale: 2 }).default('0'),
    variancePercent: decimal('variance_percent', { precision: 5, scale: 2 }),
    // Subcontractor assigned
    subcontractorId: uuid('subcontractor_id').references(() => subcontractors.id),
    // PO info
    poNumber: text('po_number'),
    poIssuedAt: timestamp('po_issued_at', { withTimezone: true }),
    // Status
    isAllowance: boolean('is_allowance').default(false), // Homeowner selection allowance
    isContingency: boolean('is_contingency').default(false),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('budget_project_idx').on(table.projectId),
    index('budget_category_idx').on(table.category),
    index('budget_trade_idx').on(table.tradeId),
    index('budget_sub_idx').on(table.subcontractorId),
  ]
);

// =============================================================================
// Invoices (Construction Billing)
// =============================================================================

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    homeownerId: uuid('homeowner_id')
      .notNull()
      .references(() => homeowners.id),
    // Invoice details
    invoiceNumber: text('invoice_number').notNull().unique(),
    type: invoiceTypeEnum('type').notNull(),
    description: text('description'),
    // Line items
    lineItems: jsonb('line_items').default([]),
    // Amounts
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
    total: decimal('total', { precision: 12, scale: 2 }).notNull(),
    // Status
    status: invoiceStatusEnum('status').default('draft').notNull(),
    // Dates
    invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    viewedAt: timestamp('viewed_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
    // Payment method
    paymentMethod: text('payment_method'), // 'check', 'ach', 'credit_card', 'wire'
    // Associated records
    changeOrderId: uuid('change_order_id').references(() => changeOrders.id),
    // Stripe integration
    stripeInvoiceId: text('stripe_invoice_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invoices_tenant_idx').on(table.tenantId),
    index('invoices_project_idx').on(table.projectId),
    index('invoices_homeowner_idx').on(table.homeownerId),
    index('invoices_status_idx').on(table.status),
    index('invoices_due_date_idx').on(table.dueDate),
  ]
);

// =============================================================================
// Daily Logs (Field Documentation)
// =============================================================================

export const dailyLogs = pgTable(
  'daily_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    // Date
    logDate: timestamp('log_date', { withTimezone: true }).notNull(),
    // Weather (auto-populated)
    weatherCondition: weatherConditionEnum('weather_condition'),
    temperatureHigh: integer('temperature_high'),
    temperatureLow: integer('temperature_low'),
    precipitation: text('precipitation'), // e.g., "0.5 inches rain"
    windSpeed: integer('wind_speed'),
    // Work summary
    workSummary: text('work_summary').notNull(),
    crewCount: integer('crew_count'),
    crewNames: text('crew_names'), // Comma-separated
    hoursWorked: decimal('hours_worked', { precision: 5, scale: 2 }),
    // Subs on site
    subsOnSite: jsonb('subs_on_site').default([]), // Array of { subcontractorId, trade, crewSize }
    // Equipment used
    equipmentUsed: jsonb('equipment_used').default([]),
    // Safety
    safetyNotes: text('safety_notes'),
    incidents: text('incidents'),
    safetyMeetingHeld: boolean('safety_meeting_held').default(false),
    // Delays/issues
    delays: text('delays'),
    delayReason: text('delay_reason'), // 'weather', 'materials', 'inspection', 'sub', 'other'
    // Inspector/site visits
    inspectorVisit: boolean('inspector_visit').default(false),
    inspectorNotes: text('inspector_notes'),
    homeownerVisit: boolean('homeowner_visit').default(false),
    // Materials delivered
    materialsDelivered: text('materials_delivered'),
    // Author
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('daily_logs_project_idx').on(table.projectId),
    index('daily_logs_date_idx').on(table.logDate),
    uniqueIndex('daily_logs_project_date_idx').on(table.projectId, table.logDate),
  ]
);

// Photos attached to daily logs
export const dailyLogPhotos = pgTable(
  'daily_log_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyLogId: uuid('daily_log_id')
      .notNull()
      .references(() => dailyLogs.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    // Photo details
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    caption: text('caption'),
    // Location/phase info
    phase: projectPhaseEnum('phase'),
    location: text('location'), // e.g., "Kitchen", "Master Bedroom"
    // AI tags
    aiTags: jsonb('ai_tags').default([]),
    aiDescription: text('ai_description'),
    // Metadata
    fileSize: integer('file_size'),
    width: integer('width'),
    height: integer('height'),
    takenAt: timestamp('taken_at', { withTimezone: true }),
    takenBy: uuid('taken_by').references(() => users.id),
    // GPS
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('photos_daily_log_idx').on(table.dailyLogId),
    index('photos_project_idx').on(table.projectId),
    index('photos_phase_idx').on(table.phase),
    index('photos_taken_at_idx').on(table.takenAt),
  ]
);

// =============================================================================
// Documents (Plans, Permits, COIs, Contracts)
// =============================================================================

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id), // Null for company docs
    homeownerId: uuid('homeowner_id').references(() => homeowners.id),
    subcontractorId: uuid('subcontractor_id').references(() => subcontractors.id),
    // Document info
    name: text('name').notNull(),
    type: documentTypeEnum('type').notNull(),
    description: text('description'),
    // File
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileType: text('file_type'), // MIME type
    fileSize: integer('file_size'),
    // Status
    status: text('status').default('active'), // 'active', 'archived', 'expired'
    // Important dates
    issueDate: timestamp('issue_date', { withTimezone: true }),
    expiryDate: timestamp('expiry_date', { withTimezone: true }),
    // For permits
    permitNumber: text('permit_number'),
    // For insurance certs
    insuranceCarrier: text('insurance_carrier'),
    coverageAmount: decimal('coverage_amount', { precision: 12, scale: 2 }),
    // Portal visibility
    visibleToHomeowner: boolean('visible_to_homeowner').default(false),
    requiresHomeownerAck: boolean('requires_homeowner_ack').default(false),
    homeownerAckedAt: timestamp('homeowner_acked_at', { withTimezone: true }),
    // Tags
    tags: jsonb('tags').default([]),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_tenant_idx').on(table.tenantId),
    index('documents_project_idx').on(table.projectId),
    index('documents_homeowner_idx').on(table.homeownerId),
    index('documents_sub_idx').on(table.subcontractorId),
    index('documents_type_idx').on(table.type),
    index('documents_expiry_idx').on(table.expiryDate),
  ]
);

// =============================================================================
// Selections (Material/Finish Selections)
// =============================================================================

export const selectionCategories = pgTable(
  'selection_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., "Kitchen Cabinets", "Flooring"
    description: text('description'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('selection_categories_tenant_idx').on(table.tenantId),
  ]
);

export const selections = pgTable(
  'selections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => selectionCategories.id),
    // Selection details
    itemName: text('item_name').notNull(),
    description: text('description'),
    // Options presented to homeowner
    options: jsonb('options').default([]), // Array of { name, description, price, imageUrl, manufacturer }
    // Selection
    selectedOptionIndex: integer('selected_option_index'), // Index in options array
    homeownerNotes: text('homeowner_notes'),
    // Allowance vs upgrade
    allowanceAmount: decimal('allowance_amount', { precision: 12, scale: 2 }),
    selectedPrice: decimal('selected_price', { precision: 12, scale: 2 }),
    upgradeCost: decimal('upgrade_cost', { precision: 12, scale: 2 }).default('0'),
    // Status
    status: text('status').default('pending'), // 'pending', 'selected', 'ordered', 'installed'
    // Due dates
    selectionDueDate: timestamp('selection_due_date', { withTimezone: true }),
    selectedAt: timestamp('selected_at', { withTimezone: true }),
    selectedBy: uuid('selected_by').references(() => homeowners.id),
    // Ordering
    orderedAt: timestamp('ordered_at', { withTimezone: true }),
    expectedDelivery: timestamp('expected_delivery', { withTimezone: true }),
    installedAt: timestamp('installed_at', { withTimezone: true }),
    // Photos
    photos: jsonb('photos').default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('selections_project_idx').on(table.projectId),
    index('selections_category_idx').on(table.categoryId),
    index('selections_status_idx').on(table.status),
    index('selections_due_date_idx').on(table.selectionDueDate),
  ]
);

// =============================================================================
// Equipment & Tools
// =============================================================================

export const equipment = pgTable(
  'equipment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    // Equipment details
    assetNumber: text('asset_number').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    manufacturer: text('manufacturer'),
    model: text('model'),
    serialNumber: text('serial_number'),
    // Category
    category: text('category'), // 'power_tool', 'heavy_equipment', 'vehicle', 'safety'
    // Purchase info
    purchaseDate: timestamp('purchase_date', { withTimezone: true }),
    purchasePrice: decimal('purchase_price', { precision: 12, scale: 2 }),
    vendor: text('vendor'),
    // Current status
    status: equipmentStatusEnum('status').default('available').notNull(),
    currentLocation: text('current_location'), // 'warehouse', project address, or 'unknown'
    currentProjectId: uuid('current_project_id').references(() => projects.id),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    // QR code for tracking
    qrCode: text('qr_code'),
    // Maintenance
    lastMaintenanceAt: timestamp('last_maintenance_at', { withTimezone: true }),
    nextMaintenanceDue: timestamp('next_maintenance_due', { withTimezone: true }),
    maintenanceNotes: text('maintenance_notes'),
    // Photos
    photos: jsonb('photos').default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('equipment_tenant_idx').on(table.tenantId),
    index('equipment_status_idx').on(table.status),
    index('equipment_project_idx').on(table.currentProjectId),
    index('equipment_asset_idx').on(table.assetNumber),
  ]
);

export const equipmentAssignments = pgTable(
  'equipment_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    equipmentId: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    // Assignment
    checkedOutAt: timestamp('checked_out_at', { withTimezone: true }).notNull(),
    checkedOutBy: uuid('checked_out_by')
      .notNull()
      .references(() => users.id),
    expectedReturn: timestamp('expected_return', { withTimezone: true }),
    // Return
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    checkedInBy: uuid('checked_in_by').references(() => users.id),
    conditionOut: text('condition_out'), // 'excellent', 'good', 'fair', 'poor'
    conditionIn: text('condition_in'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('equipment_assignments_equipment_idx').on(table.equipmentId),
    index('equipment_assignments_project_idx').on(table.projectId),
    index('equipment_assignments_out_idx').on(table.checkedOutAt),
  ]
);

// =============================================================================
// Schedule Risks (AI-Detected & Manual)
// =============================================================================

export const scheduleRisks = pgTable(
  'schedule_risks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    // Risk details
    title: text('title').notNull(),
    description: text('description').notNull(),
    severity: riskSeverityEnum('severity').notNull(),
    // Detection source
    detectedBy: text('detected_by').notNull(), // 'ai', 'manual', 'system'
    detectedFromCommunicationId: uuid('detected_from_communication_id').references(() => communications.id),
    detectedFromTaskId: uuid('detected_from_task_id').references(() => tasks.id),
    // Impact
    affectedPhase: projectPhaseEnum('affected_phase'),
    affectedTradeId: uuid('affected_trade_id').references(() => trades.id),
    estimatedDelayDays: integer('estimated_delay_days'),
    costImpact: decimal('cost_impact', { precision: 12, scale: 2 }),
    // Status
    status: text('status').default('open'), // 'open', 'monitoring', 'mitigated', 'realized', 'closed'
    probability: integer('probability'), // 0-100%
    // Mitigation
    mitigationPlan: text('mitigation_plan'),
    mitigationAssignedTo: uuid('mitigation_assigned_to').references(() => users.id),
    mitigatedAt: timestamp('mitigated_at', { withTimezone: true }),
    // Resolution
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolutionNotes: text('resolution_notes'),
    actualImpact: text('actual_impact'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('schedule_risks_project_idx').on(table.projectId),
    index('schedule_risks_severity_idx').on(table.severity),
    index('schedule_risks_status_idx').on(table.status),
  ]
);

// =============================================================================
// Activity Logs (Operational Events)
// =============================================================================

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    // What happened
    action: text('action').notNull(),
    entityType: text('entity_type'), // 'project', 'homeowner', 'task', 'communication', etc.
    entityId: uuid('entity_id'),
    // Context
    projectId: uuid('project_id').references(() => projects.id),
    metadata: jsonb('metadata').default({}),
    // Client info
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('activity_logs_tenant_idx').on(table.tenantId),
    index('activity_logs_user_idx').on(table.userId),
    index('activity_logs_project_idx').on(table.projectId),
    index('activity_logs_entity_idx').on(table.entityType, table.entityId),
    index('activity_logs_created_idx').on(table.createdAt),
  ]
);

// =============================================================================
// Relations
// =============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  homeowners: many(homeowners),
  trades: many(trades),
  subcontractors: many(subcontractors),
  projects: many(projects),
  communications: many(communications),
  invoices: many(invoices),
  documents: many(documents),
  equipment: many(equipment),
  activityLogs: many(activityLogs),
  selectionCategories: many(selectionCategories),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
  assignedTasks: many(tasks),
  managedProjects: many(projects),
  createdDailyLogs: many(dailyLogs),
  activityLogs: many(activityLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

// Homeowners
export const homeownersRelations = relations(homeowners, ({ one, many }) => ({
  tenant: one(tenants, { fields: [homeowners.tenantId], references: [tenants.id] }),
  projects: many(projects),
  contacts: many(homeownerContacts),
  communications: many(communications),
  invoices: many(invoices),
}));

export const homeownerContactsRelations = relations(homeownerContacts, ({ one }) => ({
  homeowner: one(homeowners, { fields: [homeownerContacts.homeownerId], references: [homeowners.id] }),
}));

// Trades
export const tradesRelations = relations(trades, ({ one, many }) => ({
  tenant: one(tenants, { fields: [trades.tenantId], references: [tenants.id] }),
  subcontractorTrades: many(subcontractorTrades),
  tasks: many(tasks),
  budgetLineItems: many(budgetLineItems),
}));

// Subcontractors
export const subcontractorsRelations = relations(subcontractors, ({ one, many }) => ({
  tenant: one(tenants, { fields: [subcontractors.tenantId], references: [tenants.id] }),
  primaryTrade: one(trades, { fields: [subcontractors.primaryTradeId], references: [trades.id] }),
  trades: many(subcontractorTrades),
  assignedTasks: many(tasks),
  budgetLineItems: many(budgetLineItems),
  communications: many(communications),
  changeOrders: many(changeOrders),
}));

export const subcontractorTradesRelations = relations(subcontractorTrades, ({ one }) => ({
  subcontractor: one(subcontractors, { fields: [subcontractorTrades.subcontractorId], references: [subcontractors.id] }),
  trade: one(trades, { fields: [subcontractorTrades.tradeId], references: [trades.id] }),
}));

// Projects
export const projectsRelations = relations(projects, ({ one, many }) => ({
  tenant: one(tenants, { fields: [projects.tenantId], references: [tenants.id] }),
  homeowner: one(homeowners, { fields: [projects.homeownerId], references: [homeowners.id] }),
  projectManager: one(users, { fields: [projects.projectManagerId], references: [users.id] }),
  phases: many(projectPhases),
  tasks: many(tasks),
  communications: many(communications),
  changeOrders: many(changeOrders),
  budgetLineItems: many(budgetLineItems),
  invoices: many(invoices),
  dailyLogs: many(dailyLogs),
  documents: many(documents),
  selections: many(selections),
  scheduleRisks: many(scheduleRisks),
  equipment: many(equipment),
}));

// Project Phases
export const projectPhasesRelations = relations(projectPhases, ({ one, many }) => ({
  project: one(projects, { fields: [projectPhases.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

// Tasks
export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  projectPhase: one(projectPhases, { fields: [tasks.projectPhaseId], references: [projectPhases.id] }),
  trade: one(trades, { fields: [tasks.tradeId], references: [trades.id] }),
  assignedTo: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
  assignedSubcontractor: one(subcontractors, { fields: [tasks.assignedSubcontractorId], references: [subcontractors.id] }),
}));

// Communications
export const communicationsRelations = relations(communications, ({ one, many }) => ({
  tenant: one(tenants, { fields: [communications.tenantId], references: [tenants.id] }),
  project: one(projects, { fields: [communications.projectId], references: [projects.id] }),
  homeowner: one(homeowners, { fields: [communications.homeownerId], references: [homeowners.id] }),
  subcontractor: one(subcontractors, { fields: [communications.subcontractorId], references: [subcontractors.id] }),
  transcriptions: many(callTranscriptions),
}));

export const callTranscriptionsRelations = relations(callTranscriptions, ({ one }) => ({
  communication: one(communications, { fields: [callTranscriptions.communicationId], references: [communications.id] }),
}));

// Change Orders
export const changeOrdersRelations = relations(changeOrders, ({ one }) => ({
  project: one(projects, { fields: [changeOrders.projectId], references: [projects.id] }),
  requestedByHomeowner: one(homeowners, { fields: [changeOrders.requestedByHomeownerId], references: [homeowners.id] }),
  requestedBySubcontractor: one(subcontractors, { fields: [changeOrders.requestedBySubcontractorId], references: [subcontractors.id] }),
  submittedByUser: one(users, { fields: [changeOrders.submittedBy], references: [users.id] }),
  approvedByUser: one(users, { fields: [changeOrders.approvedBy], references: [users.id] }),
}));

// Budget
export const budgetLineItemsRelations = relations(budgetLineItems, ({ one }) => ({
  project: one(projects, { fields: [budgetLineItems.projectId], references: [projects.id] }),
  trade: one(trades, { fields: [budgetLineItems.tradeId], references: [trades.id] }),
  subcontractor: one(subcontractors, { fields: [budgetLineItems.subcontractorId], references: [subcontractors.id] }),
}));

// Invoices
export const invoicesRelations = relations(invoices, ({ one }) => ({
  tenant: one(tenants, { fields: [invoices.tenantId], references: [tenants.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  homeowner: one(homeowners, { fields: [invoices.homeownerId], references: [homeowners.id] }),
  changeOrder: one(changeOrders, { fields: [invoices.changeOrderId], references: [changeOrders.id] }),
}));

// Daily Logs
export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  project: one(projects, { fields: [dailyLogs.projectId], references: [projects.id] }),
  createdBy: one(users, { fields: [dailyLogs.createdBy], references: [users.id] }),
  photos: many(dailyLogPhotos),
}));

export const dailyLogPhotosRelations = relations(dailyLogPhotos, ({ one }) => ({
  dailyLog: one(dailyLogs, { fields: [dailyLogPhotos.dailyLogId], references: [dailyLogs.id] }),
  project: one(projects, { fields: [dailyLogPhotos.projectId], references: [projects.id] }),
  takenBy: one(users, { fields: [dailyLogPhotos.takenBy], references: [users.id] }),
}));

// Documents
export const documentsRelations = relations(documents, ({ one }) => ({
  tenant: one(tenants, { fields: [documents.tenantId], references: [tenants.id] }),
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  homeowner: one(homeowners, { fields: [documents.homeownerId], references: [homeowners.id] }),
  subcontractor: one(subcontractors, { fields: [documents.subcontractorId], references: [subcontractors.id] }),
  uploadedBy: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));

// Selections
export const selectionCategoriesRelations = relations(selectionCategories, ({ one, many }) => ({
  tenant: one(tenants, { fields: [selectionCategories.tenantId], references: [tenants.id] }),
  selections: many(selections),
}));

export const selectionsRelations = relations(selections, ({ one }) => ({
  project: one(projects, { fields: [selections.projectId], references: [projects.id] }),
  category: one(selectionCategories, { fields: [selections.categoryId], references: [selectionCategories.id] }),
  selectedBy: one(homeowners, { fields: [selections.selectedBy], references: [homeowners.id] }),
}));

// Equipment
export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  tenant: one(tenants, { fields: [equipment.tenantId], references: [tenants.id] }),
  currentProject: one(projects, { fields: [equipment.currentProjectId], references: [projects.id] }),
  assignedTo: one(users, { fields: [equipment.assignedToId], references: [users.id] }),
  assignments: many(equipmentAssignments),
}));

export const equipmentAssignmentsRelations = relations(equipmentAssignments, ({ one }) => ({
  equipment: one(equipment, { fields: [equipmentAssignments.equipmentId], references: [equipment.id] }),
  project: one(projects, { fields: [equipmentAssignments.projectId], references: [projects.id] }),
  assignedTo: one(users, { fields: [equipmentAssignments.assignedToId], references: [users.id] }),
  checkedOutBy: one(users, { fields: [equipmentAssignments.checkedOutBy], references: [users.id] }),
  checkedInBy: one(users, { fields: [equipmentAssignments.checkedInBy], references: [users.id] }),
}));

// Schedule Risks
export const scheduleRisksRelations = relations(scheduleRisks, ({ one }) => ({
  project: one(projects, { fields: [scheduleRisks.projectId], references: [projects.id] }),
  detectedFromCommunication: one(communications, { fields: [scheduleRisks.detectedFromCommunicationId], references: [communications.id] }),
  detectedFromTask: one(tasks, { fields: [scheduleRisks.detectedFromTaskId], references: [tasks.id] }),
  affectedTrade: one(trades, { fields: [scheduleRisks.affectedTradeId], references: [trades.id] }),
  mitigationAssignedTo: one(users, { fields: [scheduleRisks.mitigationAssignedTo], references: [users.id] }),
}));

// Activity Logs
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [activityLogs.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  project: one(projects, { fields: [activityLogs.projectId], references: [projects.id] }),
}));
