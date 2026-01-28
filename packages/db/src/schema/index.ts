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
// Enums
// =============================================================================

export const tenantStatusEnum = pgEnum('tenant_status', [
  'active',
  'suspended',
  'cancelled',
  'trial',
]);

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member', 'client']);

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending']);

export const clientStatusEnum = pgEnum('client_status', [
  'lead',
  'prospect',
  'onboarding',
  'active',
  'completed',
  'churned',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'planning',
  'in_progress',
  'review',
  'completed',
  'on_hold',
  'cancelled',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'in_progress',
  'completed',
  'paid',
]);

export const deliverableStatusEnum = pgEnum('deliverable_status', [
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'past_due',
  'cancelled',
  'trialing',
  'incomplete',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'open', 'paid', 'void']);

export const onboardingStepEnum = pgEnum('onboarding_step', [
  'company',
  'team',
  'branding',
  'integrations',
  'billing',
  'complete',
]);

// =============================================================================
// Tenants
// =============================================================================

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    domain: text('domain'),
    logo: text('logo'),
    settings: jsonb('settings').default({}),
    plan: text('plan').default('free'),
    status: tenantStatusEnum('status').default('trial').notNull(),
    onboardingStep: onboardingStepEnum('onboarding_step').default('company'),
    onboardingData: jsonb('onboarding_data').default({}),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('tenants_slug_idx').on(table.slug), index('tenants_status_idx').on(table.status)]
);

// =============================================================================
// Users
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
    role: userRoleEnum('role').default('member').notNull(),
    status: userStatusEnum('status').default('pending').notNull(),
    mfaSecret: text('mfa_secret'),
    mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
    backupCodes: jsonb('backup_codes').default([]),
    emailVerified: boolean('email_verified').default(false).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_tenant_email_idx').on(table.tenantId, table.email),
    index('users_tenant_idx').on(table.tenantId),
    index('users_role_idx').on(table.role),
  ]
);

// =============================================================================
// Sessions
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

// =============================================================================
// OAuth Accounts
// =============================================================================

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

// =============================================================================
// Email Verification Tokens
// =============================================================================

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
// Clients (Agency Clients)
// =============================================================================

export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    website: text('website'),
    industry: text('industry'),
    notes: text('notes'),
    status: clientStatusEnum('status').default('lead').notNull(),
    onboardingStep: integer('onboarding_step').default(1),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('clients_tenant_idx').on(table.tenantId),
    index('clients_status_idx').on(table.status),
  ]
);

// =============================================================================
// Projects
// =============================================================================

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').default('draft').notNull(),
    budget: decimal('budget', { precision: 12, scale: 2 }),
    currency: text('currency').default('USD'),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('projects_tenant_idx').on(table.tenantId),
    index('projects_client_idx').on(table.clientId),
    index('projects_status_idx').on(table.status),
  ]
);

// =============================================================================
// Milestones
// =============================================================================

export const milestones = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    amount: decimal('amount', { precision: 12, scale: 2 }),
    status: milestoneStatusEnum('status').default('pending').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('milestones_project_idx').on(table.projectId),
    index('milestones_status_idx').on(table.status),
  ]
);

// =============================================================================
// Tasks
// =============================================================================

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
    assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: taskStatusEnum('status').default('backlog').notNull(),
    priority: taskPriorityEnum('priority').default('medium').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
    actualHours: decimal('actual_hours', { precision: 6, scale: 2 }),
    sortOrder: integer('sort_order').default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tasks_project_idx').on(table.projectId),
    index('tasks_milestone_idx').on(table.milestoneId),
    index('tasks_assignee_idx').on(table.assigneeId),
    index('tasks_status_idx').on(table.status),
  ]
);

// =============================================================================
// Deliverables
// =============================================================================

export const deliverables = pgTable(
  'deliverables',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description'),
    fileUrl: text('file_url'),
    fileType: text('file_type'),
    fileSize: integer('file_size'),
    status: deliverableStatusEnum('status').default('draft').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    feedback: text('feedback'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('deliverables_project_idx').on(table.projectId),
    index('deliverables_milestone_idx').on(table.milestoneId),
    index('deliverables_status_idx').on(table.status),
  ]
);

// =============================================================================
// Billing Plans
// =============================================================================

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  stripePriceId: text('stripe_price_id'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  interval: text('interval').default('month'), // 'month' | 'year'
  features: jsonb('features').default([]),
  limits: jsonb('limits').default({}),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// =============================================================================
// Subscriptions
// =============================================================================

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id').references(() => plans.id, { onDelete: 'set null' }),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeCustomerId: text('stripe_customer_id'),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('subscriptions_tenant_idx').on(table.tenantId),
    index('subscriptions_stripe_idx').on(table.stripeSubscriptionId),
  ]
);

// =============================================================================
// Invoices
// =============================================================================

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    stripeInvoiceId: text('stripe_invoice_id').unique(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').default('USD'),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    invoiceUrl: text('invoice_url'),
    pdfUrl: text('pdf_url'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    dueDate: timestamp('due_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invoices_tenant_idx').on(table.tenantId),
    index('invoices_status_idx').on(table.status),
  ]
);

// =============================================================================
// Activity Logs
// =============================================================================

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata').default({}),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('activity_logs_tenant_idx').on(table.tenantId),
    index('activity_logs_user_idx').on(table.userId),
    index('activity_logs_entity_idx').on(table.entityType, table.entityId),
    index('activity_logs_created_idx').on(table.createdAt),
  ]
);

// =============================================================================
// Team Invitations
// =============================================================================

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: userRoleEnum('role').default('member').notNull(),
    token: text('token').notNull().unique(),
    invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invitations_tenant_idx').on(table.tenantId),
    index('invitations_email_idx').on(table.email),
  ]
);

// =============================================================================
// Relations
// =============================================================================

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  clients: many(clients),
  projects: many(projects),
  subscription: one(subscriptions),
  invoices: many(invoices),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
  assignedTasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant: one(tenants, { fields: [clients.tenantId], references: [tenants.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  tenant: one(tenants, { fields: [projects.tenantId], references: [tenants.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  milestones: many(milestones),
  tasks: many(tasks),
  deliverables: many(deliverables),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  tasks: many(tasks),
  deliverables: many(deliverables),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [tasks.milestoneId], references: [milestones.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
}));

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  project: one(projects, { fields: [deliverables.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [deliverables.milestoneId], references: [milestones.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  tenant: one(tenants, { fields: [subscriptions.tenantId], references: [tenants.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  tenant: one(tenants, { fields: [invoices.tenantId], references: [tenants.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [activityLogs.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  tenant: one(tenants, { fields: [invitations.tenantId], references: [tenants.id] }),
  invitedBy: one(users, { fields: [invitations.invitedById], references: [users.id] }),
}));
