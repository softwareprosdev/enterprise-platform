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
  real,
} from 'drizzle-orm/pg-core';

// =============================================================================
// Villa Advanced Features - Enums
// =============================================================================

export const leadStageEnum = pgEnum('lead_stage', [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'website',
  'referral',
  'social_media',
  'google_ads',
  'facebook_ads',
  'instagram',
  'showroom',
  'home_show',
  'realtor',
  'repeat_client',
  'other',
]);

export const callDirectionEnum = pgEnum('call_direction', ['inbound', 'outbound']);
export const callStatusEnum = pgEnum('call_status', ['ringing', 'in_progress', 'completed', 'missed', 'voicemail', 'failed']);

export const smsDirectionEnum = pgEnum('sms_direction', ['inbound', 'outbound']);
export const smsStatusEnum = pgEnum('sms_status', ['queued', 'sent', 'delivered', 'failed', 'received']);

export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']);

export const rfiStatusEnum = pgEnum('rfi_status', ['open', 'pending_response', 'answered', 'closed']);
export const submittalStatusEnum = pgEnum('submittal_status', ['pending', 'approved', 'rejected', 'resubmit']);

export const permitStatusEnum = pgEnum('permit_status', ['not_applied', 'applied', 'in_review', 'approved', 'expired', 'rejected']);

export const warrantyStatusEnum = pgEnum('warranty_status', ['reported', 'scheduled', 'in_progress', 'resolved', 'closed']);

export const droneFlightStatusEnum = pgEnum('drone_flight_status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'failed']);

export const safetyViolationTypeEnum = pgEnum('safety_violation_type', [
  'missing_ppe',
  'fall_hazard',
  'electrical_hazard',
  'housekeeping',
  'equipment_misuse',
  'other',
]);

export const crewStatusEnum = pgEnum('crew_status', ['clocked_in', 'clocked_out', 'on_break', 'in_transit']);

// =============================================================================
// Lead Management
// =============================================================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  companyName: text('company_name'),
  contactName: text('contact_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  source: leadSourceEnum('source').default('website'),
  stage: leadStageEnum('stage').default('new'),
  estimatedValue: decimal('estimated_value', { precision: 12, scale: 2 }),
  probability: integer('probability').default(50),
  assignedToId: uuid('assigned_to_id'),
  nextFollowUp: timestamp('next_follow_up'),
  lastContactAt: timestamp('last_contact_at'),
  projectType: text('project_type'),
  projectLocation: text('project_location'),
  projectTimeline: text('project_timeline'),
  budgetRange: text('budget_range'),
  notes: text('notes'),
  aiScore: integer('ai_score'), // AI-calculated lead score 0-100
  aiScoreFactors: jsonb('ai_score_factors'), // Breakdown of scoring factors
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('leads_tenant_idx').on(table.tenantId),
  stageIdx: index('leads_stage_idx').on(table.stage),
  assignedIdx: index('leads_assigned_idx').on(table.assignedToId),
}));

export const leadActivities = pgTable('lead_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull(),
  type: text('type').notNull(), // call, email, meeting, note, status_change
  description: text('description'),
  metadata: jsonb('metadata'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// Villa Phone (VoIP)
// =============================================================================

export const phoneNumbers = pgTable('phone_numbers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  phoneNumber: text('phone_number').notNull().unique(),
  friendlyName: text('friendly_name'),
  provider: text('provider').default('twilio'), // twilio, telnyx
  providerSid: text('provider_sid'),
  capabilities: jsonb('capabilities'), // voice, sms, mms
  isActive: boolean('is_active').default(true),
  assignedToId: uuid('assigned_to_id'), // User who owns this number
  createdAt: timestamp('created_at').defaultNow(),
});

export const voipCalls = pgTable('voip_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  phoneNumberId: uuid('phone_number_id'),
  direction: callDirectionEnum('direction').notNull(),
  fromNumber: text('from_number').notNull(),
  toNumber: text('to_number').notNull(),
  status: callStatusEnum('status').default('ringing'),
  duration: integer('duration'), // seconds
  recordingUrl: text('recording_url'),
  recordingSid: text('recording_sid'),
  transcription: text('transcription'),
  transcriptionConfidence: real('transcription_confidence'),
  aiSummary: text('ai_summary'),
  aiActionItems: jsonb('ai_action_items'),
  aiKeywords: jsonb('ai_keywords'), // detected keywords like "delay", "budget"
  sentimentScore: real('sentiment_score'), // -1 to 1
  riskDetected: boolean('risk_detected').default(false),
  riskDetails: text('risk_details'),
  // Link to entity
  linkedToType: text('linked_to_type'), // homeowner, subcontractor, lead
  linkedToId: uuid('linked_to_id'),
  projectId: uuid('project_id'),
  userId: uuid('user_id'), // Who made/received the call
  providerCallSid: text('provider_call_sid'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('voip_calls_tenant_idx').on(table.tenantId),
  projectIdx: index('voip_calls_project_idx').on(table.projectId),
  linkedIdx: index('voip_calls_linked_idx').on(table.linkedToType, table.linkedToId),
}));

export const smsMessages = pgTable('sms_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  phoneNumberId: uuid('phone_number_id'),
  direction: smsDirectionEnum('direction').notNull(),
  fromNumber: text('from_number').notNull(),
  toNumber: text('to_number').notNull(),
  body: text('body'),
  mediaUrls: jsonb('media_urls'),
  status: smsStatusEnum('status').default('queued'),
  providerMessageSid: text('provider_message_sid'),
  linkedToType: text('linked_to_type'),
  linkedToId: uuid('linked_to_id'),
  projectId: uuid('project_id'),
  userId: uuid('user_id'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('sms_messages_tenant_idx').on(table.tenantId),
}));

// =============================================================================
// Proposals & Estimates
// =============================================================================

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  leadId: uuid('lead_id'),
  projectId: uuid('project_id'),
  proposalNumber: text('proposal_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  lineItems: jsonb('line_items'), // Array of {description, quantity, unit, unitPrice, total}
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }),
  total: decimal('total', { precision: 12, scale: 2 }),
  status: proposalStatusEnum('status').default('draft'),
  validUntil: timestamp('valid_until'),
  sentAt: timestamp('sent_at'),
  viewedAt: timestamp('viewed_at'),
  signedAt: timestamp('signed_at'),
  signatureData: jsonb('signature_data'),
  signedByName: text('signed_by_name'),
  signedByEmail: text('signed_by_email'),
  termsAndConditions: text('terms_and_conditions'),
  notes: text('notes'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const estimates = pgTable('estimates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id'),
  version: integer('version').default(1),
  name: text('name').notNull(),
  categories: jsonb('categories'), // Detailed breakdown by category
  laborTotal: decimal('labor_total', { precision: 12, scale: 2 }),
  materialTotal: decimal('material_total', { precision: 12, scale: 2 }),
  equipmentTotal: decimal('equipment_total', { precision: 12, scale: 2 }),
  subcontractorTotal: decimal('subcontractor_total', { precision: 12, scale: 2 }),
  overheadPercent: decimal('overhead_percent', { precision: 5, scale: 2 }),
  profitPercent: decimal('profit_percent', { precision: 5, scale: 2 }),
  contingencyPercent: decimal('contingency_percent', { precision: 5, scale: 2 }),
  grandTotal: decimal('grand_total', { precision: 12, scale: 2 }),
  aiConfidence: real('ai_confidence'), // AI confidence in estimate
  aiSuggestions: jsonb('ai_suggestions'), // AI recommendations
  basedOnProjects: jsonb('based_on_projects'), // Similar projects used for AI estimate
  status: text('status').default('draft'),
  approvedAt: timestamp('approved_at'),
  approvedById: uuid('approved_by_id'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// Field Operations
// =============================================================================

export const sitePhotos = pgTable('site_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  dailyLogId: uuid('daily_log_id'),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  location: text('location'), // Room/area
  gpsCoordinates: jsonb('gps_coordinates'),
  aiTags: jsonb('ai_tags'), // AI-detected objects/phases
  aiProgressPercent: real('ai_progress_percent'), // AI-detected progress
  aiSafetyIssues: jsonb('ai_safety_issues'), // AI-detected safety violations
  takenAt: timestamp('taken_at'),
  takenById: uuid('taken_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rfis = pgTable('rfis', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  rfiNumber: text('rfi_number').notNull(),
  subject: text('subject').notNull(),
  question: text('question').notNull(),
  status: rfiStatusEnum('status').default('open'),
  priority: text('priority').default('normal'),
  assignedToId: uuid('assigned_to_id'),
  dueDate: timestamp('due_date'),
  response: text('response'),
  respondedById: uuid('responded_by_id'),
  respondedAt: timestamp('responded_at'),
  attachments: jsonb('attachments'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const submittals = pgTable('submittals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  submittalNumber: text('submittal_number').notNull(),
  title: text('title').notNull(),
  specSection: text('spec_section'),
  status: submittalStatusEnum('status').default('pending'),
  subcontractorId: uuid('subcontractor_id'),
  documents: jsonb('documents'),
  notes: text('notes'),
  dueDate: timestamp('due_date'),
  reviewedById: uuid('reviewed_by_id'),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const changeOrders = pgTable('change_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  changeOrderNumber: text('change_order_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  reason: text('reason'),
  costImpact: decimal('cost_impact', { precision: 12, scale: 2 }),
  scheduleImpactDays: integer('schedule_impact_days'),
  status: text('status').default('draft'), // draft, pending, approved, rejected
  requestedById: uuid('requested_by_id'),
  approvedById: uuid('approved_by_id'),
  approvedAt: timestamp('approved_at'),
  clientApprovalRequired: boolean('client_approval_required').default(true),
  clientApprovedAt: timestamp('client_approved_at'),
  clientSignature: jsonb('client_signature'),
  attachments: jsonb('attachments'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// GPS Crew Tracking
// =============================================================================

export const crewLocations = pgTable('crew_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  accuracy: real('accuracy'),
  altitude: real('altitude'),
  speed: real('speed'),
  heading: real('heading'),
  projectId: uuid('project_id'), // If within a geofenced project
  status: crewStatusEnum('status').default('clocked_out'),
  recordedAt: timestamp('recorded_at').defaultNow(),
}, (table) => ({
  userIdx: index('crew_locations_user_idx').on(table.userId),
  recordedIdx: index('crew_locations_recorded_idx').on(table.recordedAt),
}));

export const geofences = pgTable('geofences', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id'),
  name: text('name').notNull(),
  type: text('type').default('circle'), // circle, polygon
  centerLatitude: real('center_latitude'),
  centerLongitude: real('center_longitude'),
  radiusMeters: real('radius_meters'),
  polygonCoordinates: jsonb('polygon_coordinates'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const timeClockEntries = pgTable('time_clock_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  projectId: uuid('project_id'),
  clockInAt: timestamp('clock_in_at').notNull(),
  clockInLocation: jsonb('clock_in_location'),
  clockInMethod: text('clock_in_method'), // gps_auto, manual, qr_code
  clockOutAt: timestamp('clock_out_at'),
  clockOutLocation: jsonb('clock_out_location'),
  clockOutMethod: text('clock_out_method'),
  breakMinutes: integer('break_minutes').default(0),
  totalMinutes: integer('total_minutes'),
  notes: text('notes'),
  approvedById: uuid('approved_by_id'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// Drone Integration
// =============================================================================

export const droneFlights = pgTable('drone_flights', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  droneModel: text('drone_model'), // DJI Phantom 4, Mavic 3, etc.
  droneSerialNumber: text('drone_serial_number'),
  pilotId: uuid('pilot_id'),
  flightPlanId: uuid('flight_plan_id'),
  status: droneFlightStatusEnum('status').default('scheduled'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  flightDurationSeconds: integer('flight_duration_seconds'),
  distanceMeters: real('distance_meters'),
  maxAltitudeMeters: real('max_altitude_meters'),
  weatherConditions: jsonb('weather_conditions'),
  flightPath: jsonb('flight_path'), // Array of GPS coordinates
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const droneFlightPlans = pgTable('drone_flight_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  name: text('name').notNull(),
  waypoints: jsonb('waypoints'), // Array of {lat, lng, altitude, action}
  isRecurring: boolean('is_recurring').default(false),
  recurringSchedule: jsonb('recurring_schedule'), // cron-like schedule
  altitudeMeters: real('altitude_meters').default(50),
  cameraAngle: real('camera_angle').default(-90), // degrees
  overlapPercent: real('overlap_percent').default(70),
  isActive: boolean('is_active').default(true),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const droneImages = pgTable('drone_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  flightId: uuid('flight_id').notNull(),
  projectId: uuid('project_id').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  altitude: real('altitude'),
  heading: real('heading'),
  gimbalPitch: real('gimbal_pitch'),
  aiProgressAnalysis: jsonb('ai_progress_analysis'),
  aiComparisonWithPrevious: jsonb('ai_comparison_with_previous'),
  takenAt: timestamp('taken_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// Safety Compliance
// =============================================================================

export const safetyViolations = pgTable('safety_violations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  photoId: uuid('photo_id'),
  type: safetyViolationTypeEnum('type').notNull(),
  description: text('description'),
  severity: text('severity').default('medium'), // low, medium, high, critical
  aiDetected: boolean('ai_detected').default(false),
  aiConfidence: real('ai_confidence'),
  location: text('location'),
  reportedById: uuid('reported_by_id'),
  resolvedById: uuid('resolved_by_id'),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const safetyMeetings = pgTable('safety_meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  meetingDate: timestamp('meeting_date').notNull(),
  topic: text('topic').notNull(),
  description: text('description'),
  attendees: jsonb('attendees'), // Array of user IDs
  signInSheet: jsonb('sign_in_sheet'), // Signatures
  notes: text('notes'),
  conductedById: uuid('conducted_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// Permits & Compliance
// =============================================================================

export const permits = pgTable('permits', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  permitType: text('permit_type').notNull(), // building, electrical, plumbing, etc.
  permitNumber: text('permit_number'),
  status: permitStatusEnum('status').default('not_applied'),
  jurisdiction: text('jurisdiction'),
  appliedDate: timestamp('applied_date'),
  approvedDate: timestamp('approved_date'),
  expiresDate: timestamp('expires_date'),
  inspectionsDue: jsonb('inspections_due'),
  documents: jsonb('documents'),
  fees: decimal('fees', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const warrantyItems = pgTable('warranty_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  homeownerId: uuid('homeowner_id'),
  description: text('description').notNull(),
  category: text('category'), // plumbing, electrical, structural, etc.
  status: warrantyStatusEnum('status').default('reported'),
  priority: text('priority').default('normal'),
  reportedDate: timestamp('reported_date').defaultNow(),
  scheduledDate: timestamp('scheduled_date'),
  resolvedDate: timestamp('resolved_date'),
  resolutionNotes: text('resolution_notes'),
  assignedToId: uuid('assigned_to_id'),
  subcontractorId: uuid('subcontractor_id'),
  photos: jsonb('photos'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// Social Media & Marketing
// =============================================================================

export const socialMediaAccounts = pgTable('social_media_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  platform: text('platform').notNull(), // facebook, instagram, whatsapp
  accountId: text('account_id'),
  accountName: text('account_name'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const socialMediaPosts = pgTable('social_media_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  accountId: uuid('account_id').notNull(),
  projectId: uuid('project_id'),
  platform: text('platform').notNull(),
  postType: text('post_type'), // image, video, carousel, story
  content: text('content'),
  mediaUrls: jsonb('media_urls'),
  platformPostId: text('platform_post_id'),
  status: text('status').default('draft'), // draft, scheduled, published, failed
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  engagement: jsonb('engagement'), // likes, comments, shares, reach
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adCampaigns = pgTable('ad_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  platform: text('platform').notNull(), // facebook, instagram, google
  campaignName: text('campaign_name').notNull(),
  objective: text('objective'), // leads, traffic, awareness
  status: text('status').default('draft'),
  budget: decimal('budget', { precision: 10, scale: 2 }),
  budgetType: text('budget_type'), // daily, lifetime
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  targeting: jsonb('targeting'),
  creatives: jsonb('creatives'),
  platformCampaignId: text('platform_campaign_id'),
  metrics: jsonb('metrics'), // impressions, clicks, leads, cost
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// AI Assistant
// =============================================================================

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  sessionId: text('session_id'),
  messages: jsonb('messages'), // Array of {role, content, timestamp}
  context: jsonb('context'), // Current context (project, client, etc.)
  actionsExecuted: jsonb('actions_executed'), // Actions AI took
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiRiskPredictions = pgTable('ai_risk_predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  projectId: uuid('project_id').notNull(),
  riskType: text('risk_type').notNull(), // schedule, budget, client, subcontractor
  riskScore: real('risk_score').notNull(), // 0-100
  confidence: real('confidence').notNull(), // 0-1
  factors: jsonb('factors'), // Contributing factors
  recommendations: jsonb('recommendations'),
  predictedImpact: jsonb('predicted_impact'), // days, dollars
  isAcknowledged: boolean('is_acknowledged').default(false),
  acknowledgedById: uuid('acknowledged_by_id'),
  acknowledgedAt: timestamp('acknowledged_at'),
  mitigationActions: jsonb('mitigation_actions'),
  outcome: text('outcome'), // Was prediction accurate?
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// Financial Integration
// =============================================================================

export const bankConnections = pgTable('bank_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  provider: text('provider').default('plaid'), // plaid, yodlee
  institutionId: text('institution_id'),
  institutionName: text('institution_name'),
  accessToken: text('access_token'),
  itemId: text('item_id'),
  accounts: jsonb('accounts'), // Array of connected accounts
  lastSyncAt: timestamp('last_sync_at'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bankTransactions = pgTable('bank_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  connectionId: uuid('connection_id').notNull(),
  accountId: text('account_id').notNull(),
  transactionId: text('transaction_id').notNull().unique(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  name: text('name'),
  merchantName: text('merchant_name'),
  category: jsonb('category'),
  pending: boolean('pending').default(false),
  projectId: uuid('project_id'), // Linked project
  expenseId: uuid('expense_id'), // Linked expense
  isReconciled: boolean('is_reconciled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quickbooksSyncLog = pgTable('quickbooks_sync_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  syncType: text('sync_type').notNull(), // invoice, payment, expense, customer
  direction: text('direction').notNull(), // to_qb, from_qb
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  qbEntityId: text('qb_entity_id'),
  status: text('status').default('pending'), // pending, success, failed
  errorMessage: text('error_message'),
  syncedAt: timestamp('synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
