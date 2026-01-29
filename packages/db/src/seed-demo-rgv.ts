/**
 * Rio Grande Valley Demo Data Seeding Script
 * Creates realistic construction data for Cameron & Hidalgo County, South Texas
 * Run with: pnpm --filter @enterprise/db seed:demo
 */

import { db } from './index.js';
import { 
  tenants, users, homeowners, projects, projectPhases, tasks, 
  subcontractors, trades, subcontractorTrades, communications, 
  budgetLineItems, plans 
} from './schema/index.js';
import { hash } from '@node-rs/argon2';

const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function seedRGVDemo() {
  console.log('🌱 Seeding Rio Grande Valley demo data...');

  try {
    // Create plans first
    console.log('💳 Creating subscription plans...');
    const [freePlan, starterPlan, proPlan] = await db
      .insert(plans)
      .values([
        {
          name: 'Free Trial',
          slug: 'free',
          description: 'Perfect for getting started',
          price: '0',
          currency: 'usd',
          interval: 'month',
          features: ['1 active project', '2 team members', '5 homeowners', 'Basic reporting'],
          limits: { projects: 1, teamMembers: 2, clients: 5 },
          isActive: true,
          sortOrder: 1,
        },
        {
          name: 'Professional',
          slug: 'pro',
          description: 'For growing builders',
          price: '149',
          currency: 'usd',
          interval: 'month',
          features: ['20 active projects', '15 team members', 'Unlimited homeowners', 'Advanced analytics'],
          limits: { projects: 20, teamMembers: 15, clients: -1 },
          isActive: true,
          sortOrder: 2,
        },
        {
          name: 'Enterprise',
          slug: 'enterprise',
          description: 'For large operations',
          price: '499',
          currency: 'usd',
          interval: 'month',
          features: ['Unlimited projects', 'Unlimited team', 'White-label', 'Dedicated support'],
          limits: { projects: -1, teamMembers: -1, clients: -1 },
          isActive: true,
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing()
      .returning();

    // Create Villa Homes RGV tenant
    console.log('🏢 Creating Villa Homes RGV tenant...');
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: 'Villa Homes RGV',
        slug: 'villa-homes-rgv',
        plan: 'pro',
        status: 'active',
        onboardingStep: 'complete',
        logo: 'https://villahomes.ai/logo.png',
        domain: 'villahomes.ai',
        settings: {
          companyAddress: '1120 W Jefferson Ave, Harlingen, TX 78550',
          companyPhone: '(956) 428-3500',
          licenseNumber: 'TX-HB-45219',
          defaultMarkupPercent: 18,
          warrantyPeriodMonths: 12,
        },
      })
      .returning();

    console.log('✅ Created tenant:', tenant.name);

    // Create demo users
    console.log('👥 Creating team members...');
    const passwordHash = await hash('Demo123!', HASH_OPTIONS);

    const [owner, pm1, pm2, officeStaff, fieldSuper] = await db
      .insert(users)
      .values([
        {
          tenantId: tenant.id,
          email: 'carlos.martinez@villahomes.ai',
          passwordHash,
          name: 'Carlos Martinez',
          role: 'owner',
          status: 'active',
          emailVerified: true,
          phone: '(956) 428-3500',
          title: 'Owner & CEO',
        },
        {
          tenantId: tenant.id,
          email: 'maria.garcia@villahomes.ai',
          passwordHash,
          name: 'Maria Garcia',
          role: 'project_manager',
          status: 'active',
          emailVerified: true,
          phone: '(956) 428-3501',
          title: 'Senior Project Manager',
        },
        {
          tenantId: tenant.id,
          email: 'roberto.lopez@villahomes.ai',
          passwordHash,
          name: 'Roberto Lopez',
          role: 'project_manager',
          status: 'active',
          emailVerified: true,
          phone: '(956) 428-3502',
          title: 'Project Manager',
        },
        {
          tenantId: tenant.id,
          email: 'ana.rodriguez@villahomes.ai',
          passwordHash,
          name: 'Ana Rodriguez',
          role: 'office_staff',
          status: 'active',
          emailVerified: true,
          phone: '(956) 428-3503',
          title: 'Office Manager',
        },
        {
          tenantId: tenant.id,
          email: 'juan.hernandez@villahomes.ai',
          passwordHash,
          name: 'Juan Hernandez',
          role: 'field_staff',
          status: 'active',
          emailVerified: true,
          phone: '(956) 428-3504',
          title: 'Field Superintendent',
          canReceiveCalls: true,
        },
      ])
      .returning();

    console.log('✅ Created 5 team members');

    // Create trades
    console.log('🔧 Creating construction trades...');
    const tradesList = await db
      .insert(trades)
      .values([
        { tenantId: tenant.id, name: 'General Contractor', category: 'general_contractor', description: 'Overall project coordination', sortOrder: 1 },
        { tenantId: tenant.id, name: 'Excavation & Site Prep', category: 'excavation', description: 'Land clearing and foundation prep', typicalDurationDays: 5, sortOrder: 2 },
        { tenantId: tenant.id, name: 'Concrete & Foundation', category: 'concrete', description: 'Slab and foundation work', typicalDurationDays: 10, sortOrder: 3 },
        { tenantId: tenant.id, name: 'Framing', category: 'framing', description: 'Structural framing', typicalDurationDays: 15, sortOrder: 4 },
        { tenantId: tenant.id, name: 'Roofing', category: 'roofing', description: 'Roof installation', typicalDurationDays: 7, sortOrder: 5 },
        { tenantId: tenant.id, name: 'Plumbing', category: 'plumbing', description: 'Plumbing rough-in and finish', typicalDurationDays: 10, sortOrder: 6 },
        { tenantId: tenant.id, name: 'Electrical', category: 'electrical', description: 'Electrical systems', typicalDurationDays: 10, sortOrder: 7 },
        { tenantId: tenant.id, name: 'HVAC', category: 'hvac', description: 'Climate control systems', typicalDurationDays: 8, sortOrder: 8 },
        { tenantId: tenant.id, name: 'Drywall & Texture', category: 'drywall', description: 'Drywall installation', typicalDurationDays: 10, sortOrder: 9 },
        { tenantId: tenant.id, name: 'Painting', category: 'painting', description: 'Interior and exterior paint', typicalDurationDays: 7, sortOrder: 10 },
        { tenantId: tenant.id, name: 'Flooring', category: 'flooring', description: 'Tile, wood, carpet installation', typicalDurationDays: 5, sortOrder: 11 },
        { tenantId: tenant.id, name: 'Cabinets & Countertops', category: 'cabinets', description: 'Kitchen and bath cabinets', typicalDurationDays: 5, sortOrder: 12 },
        { tenantId: tenant.id, name: 'Landscaping', category: 'landscaping', description: 'Yard and exterior work', typicalDurationDays: 7, sortOrder: 13 },
      ])
      .returning();

    console.log('✅ Created 13 trades');

    // Create subcontractors (RGV-based companies)
    console.log('👷 Creating subcontractors...');
    const [excavationSub, concreteSub, framingSub, roofingSub, plumbingSub, electricalSub, hvacSub] = await db
      .insert(subcontractors)
      .values([
        {
          tenantId: tenant.id,
          companyName: 'Valley Excavation & Grading',
          contactName: 'Miguel Sanchez',
          contactEmail: 'miguel@valleyexcavation.com',
          contactPhone: '(956) 546-7890',
          primaryTradeId: tradesList.find(t => t.category === 'excavation')?.id,
          address: '2340 FM 802',
          city: 'Brownsville',
          state: 'TX',
          zipCode: '78520',
          licenseNumber: 'TX-EXC-8821',
          status: 'preferred',
          rating: '4.8',
          onTimePercentage: 92,
          totalProjectsCompleted: 47,
        },
        {
          tenantId: tenant.id,
          companyName: 'Rio Grande Concrete Works',
          contactName: 'Jose Garza',
          contactEmail: 'jose@rgconcrete.com',
          contactPhone: '(956) 423-1100',
          primaryTradeId: tradesList.find(t => t.category === 'concrete')?.id,
          address: '890 Industrial Blvd',
          city: 'McAllen',
          state: 'TX',
          zipCode: '78501',
          licenseNumber: 'TX-CON-5512',
          insuranceCarrier: 'Texas Mutual',
          insurancePolicyNumber: 'TM-992847',
          insuranceCoverageAmount: '2000000',
          status: 'preferred',
          rating: '5.0',
          onTimePercentage: 96,
          totalProjectsCompleted: 89,
        },
        {
          tenantId: tenant.id,
          companyName: 'Precision Framing LLC',
          contactName: 'David Flores',
          contactEmail: 'david@precisionframing.com',
          contactPhone: '(956) 380-4422',
          primaryTradeId: tradesList.find(t => t.category === 'framing')?.id,
          address: '1520 E Harrison Ave',
          city: 'Harlingen',
          state: 'TX',
          zipCode: '78550',
          licenseNumber: 'TX-FRM-7734',
          status: 'active',
          rating: '4.5',
          onTimePercentage: 88,
          totalProjectsCompleted: 62,
        },
        {
          tenantId: tenant.id,
          companyName: 'South Texas Roofing Solutions',
          contactName: 'Ricardo Morales',
          contactEmail: 'ricardo@stxroofing.com',
          contactPhone: '(956) 664-8800',
          primaryTradeId: tradesList.find(t => t.category === 'roofing')?.id,
          address: '3401 N 10th St',
          city: 'McAllen',
          state: 'TX',
          zipCode: '78501',
          licenseNumber: 'TX-ROF-4421',
          insuranceCarrier: 'State Farm',
          insurancePolicyNumber: 'SF-445821',
          insuranceCoverageAmount: '1500000',
          status: 'preferred',
          rating: '4.9',
          onTimePercentage: 94,
          totalProjectsCompleted: 71,
        },
        {
          tenantId: tenant.id,
          companyName: 'Valley Plumbing & Gas',
          contactName: 'Luis Ramirez',
          contactEmail: 'luis@valleyplumbing.com',
          contactPhone: '(956) 542-3300',
          primaryTradeId: tradesList.find(t => t.category === 'plumbing')?.id,
          address: '1890 Boca Chica Blvd',
          city: 'Brownsville',
          state: 'TX',
          zipCode: '78521',
          licenseNumber: 'TX-PLM-9912',
          status: 'active',
          rating: '4.6',
          onTimePercentage: 90,
          totalProjectsCompleted: 55,
        },
        {
          tenantId: tenant.id,
          companyName: 'Border Electric Services',
          contactName: 'Antonio Gutierrez',
          contactEmail: 'antonio@borderelectric.com',
          contactPhone: '(956) 618-7700',
          primaryTradeId: tradesList.find(t => t.category === 'electrical')?.id,
          address: '2200 S Closner Blvd',
          city: 'Edinburg',
          state: 'TX',
          zipCode: '78539',
          licenseNumber: 'TX-ELE-3387',
          insuranceCarrier: 'Liberty Mutual',
          insurancePolicyNumber: 'LM-778234',
          insuranceCoverageAmount: '1000000',
          status: 'preferred',
          rating: '4.7',
          onTimePercentage: 91,
          totalProjectsCompleted: 68,
        },
        {
          tenantId: tenant.id,
          companyName: 'Cool Breeze HVAC',
          contactName: 'Fernando Castillo',
          contactEmail: 'fernando@coolbreezehvac.com',
          contactPhone: '(956) 687-2200',
          primaryTradeId: tradesList.find(t => t.category === 'hvac')?.id,
          address: '4501 N McColl Rd',
          city: 'McAllen',
          state: 'TX',
          zipCode: '78504',
          licenseNumber: 'TX-HVAC-6651',
          status: 'active',
          rating: '4.4',
          onTimePercentage: 87,
          totalProjectsCompleted: 43,
        },
      ])
      .returning();

    console.log('✅ Created 7 subcontractors');

    // Create homeowners (RGV families)
    console.log('🏠 Creating homeowners...');
    const [homeowner1, homeowner2, homeowner3, homeowner4, homeowner5] = await db
      .insert(homeowners)
      .values([
        {
          tenantId: tenant.id,
          firstName: 'Eduardo',
          lastName: 'Gonzalez',
          email: 'eduardo.gonzalez@gmail.com',
          phone: '(956) 233-4567',
          mobilePhone: '(956) 233-4567',
          currentAddress: '1845 Palm Valley Dr, Harlingen, TX 78552',
          status: 'construction',
          contractSignedAt: new Date('2024-11-15'),
          contractAmount: '385000',
          leadSource: 'referral',
          referredBy: 'Dr. Ramirez',
          portalEnabled: true,
          preferredContactMethod: 'text',
          communicationFrequency: 'weekly',
          notes: 'Prefers modern farmhouse style. Wants energy-efficient upgrades.',
        },
        {
          tenantId: tenant.id,
          firstName: 'Sofia',
          lastName: 'Trevino',
          email: 'sofia.trevino@yahoo.com',
          phone: '(956) 781-2234',
          mobilePhone: '(956) 781-2234',
          currentAddress: '3201 N 23rd St, McAllen, TX 78501',
          status: 'construction',
          contractSignedAt: new Date('2024-10-20'),
          contractAmount: '425000',
          leadSource: 'website',
          portalEnabled: true,
          preferredContactMethod: 'email',
          communicationFrequency: 'daily',
          notes: 'First-time homebuyer. Very detail-oriented. Wants weekly photo updates.',
        },
        {
          tenantId: tenant.id,
          firstName: 'Ricardo',
          lastName: 'Salinas',
          email: 'rsalinas@outlook.com',
          phone: '(956) 544-8899',
          mobilePhone: '(956) 544-8899',
          currentAddress: '890 Resaca Blvd, Brownsville, TX 78520',
          status: 'contracted',
          contractSignedAt: new Date('2025-01-10'),
          contractAmount: '465000',
          leadSource: 'showroom',
          portalEnabled: false,
          preferredContactMethod: 'phone',
          communicationFrequency: 'weekly',
          notes: 'Wants to start construction in March. Interested in smart home features.',
        },
        {
          tenantId: tenant.id,
          firstName: 'Patricia',
          lastName: 'Villarreal',
          email: 'pvillarreal@gmail.com',
          phone: '(956) 292-5566',
          mobilePhone: '(956) 292-5566',
          currentAddress: '2100 Treasure Hills Blvd, Harlingen, TX 78550',
          status: 'punch_list',
          contractSignedAt: new Date('2024-06-01'),
          contractAmount: '398000',
          leadSource: 'referral',
          referredBy: 'Gonzalez Family',
          portalEnabled: true,
          preferredContactMethod: 'email',
          communicationFrequency: 'milestone',
          notes: 'Nearing completion. Very satisfied with quality. Potential referral source.',
        },
        {
          tenantId: tenant.id,
          firstName: 'Miguel',
          lastName: 'Cantu',
          email: 'mcantu@icloud.com',
          phone: '(956) 447-3322',
          mobilePhone: '(956) 447-3322',
          currentAddress: '5601 N McColl Rd, McAllen, TX 78504',
          status: 'inquiry',
          leadSource: 'website',
          portalEnabled: false,
          preferredContactMethod: 'phone',
          communicationFrequency: 'weekly',
          notes: 'Interested in Belmont Ridge community. Budget: $400-450k. Timeline: Summer 2025.',
        },
      ])
      .returning();

    console.log('✅ Created 5 homeowners');

    // Create projects (Cameron & Hidalgo County locations)
    console.log('🏗️ Creating construction projects...');
    const [project1, project2, project3, project4] = await db
      .insert(projects)
      .values([
        {
          tenantId: tenant.id,
          homeownerId: homeowner1.id,
          projectManagerId: pm1.id,
          projectNumber: 'VH-2024-001',
          name: 'Gonzalez Residence - Belmont Ridge',
          description: 'Modern farmhouse on corner lot with extended patio',
          address: '2401 Belmont Ridge Dr, Lot 12',
          city: 'Harlingen',
          state: 'TX',
          zipCode: '78552',
          subdivision: 'Belmont Ridge Estates',
          lotNumber: '12',
          status: 'active',
          currentPhase: 'framing',
          contractDate: new Date('2024-11-15'),
          estimatedStartDate: new Date('2024-12-01'),
          estimatedCompletionDate: new Date('2025-06-15'),
          actualStartDate: new Date('2024-12-03'),
          contractAmount: '385000',
          budgetTotal: '385000',
          totalSpent: '142500',
          totalInvoiced: '115500',
          totalPaid: '115500',
          squareFootage: 2450,
          bedrooms: 4,
          bathrooms: '3.5',
          stories: 2,
          garageSpaces: 2,
          permitNumber: 'HAR-2024-RES-1142',
          permitIssueDate: new Date('2024-11-22'),
        },
        {
          tenantId: tenant.id,
          homeownerId: homeowner2.id,
          projectManagerId: pm1.id,
          projectNumber: 'VH-2024-002',
          name: 'Trevino Residence - Palm Valley',
          description: 'Contemporary single-story with pool prep',
          address: '3890 Palm Valley Blvd, Lot 7',
          city: 'McAllen',
          state: 'TX',
          zipCode: '78503',
          subdivision: 'Palm Valley Estates',
          lotNumber: '7',
          status: 'active',
          currentPhase: 'rough_in',
          contractDate: new Date('2024-10-20'),
          estimatedStartDate: new Date('2024-11-05'),
          estimatedCompletionDate: new Date('2025-05-20'),
          actualStartDate: new Date('2024-11-07'),
          contractAmount: '425000',
          budgetTotal: '425000',
          totalSpent: '198000',
          totalInvoiced: '170000',
          totalPaid: '170000',
          squareFootage: 2680,
          bedrooms: 4,
          bathrooms: '3.0',
          stories: 1,
          garageSpaces: 3,
          permitNumber: 'MCA-2024-RES-0887',
          permitIssueDate: new Date('2024-10-28'),
        },
        {
          tenantId: tenant.id,
          homeownerId: homeowner3.id,
          projectManagerId: pm2.id,
          projectNumber: 'VH-2025-003',
          name: 'Salinas Residence - Resaca Heights',
          description: 'Traditional two-story with game room',
          address: '1205 Resaca Heights Dr, Lot 23',
          city: 'Brownsville',
          state: 'TX',
          zipCode: '78526',
          subdivision: 'Resaca Heights',
          lotNumber: '23',
          status: 'planning',
          currentPhase: 'pre_construction',
          contractDate: new Date('2025-01-10'),
          estimatedStartDate: new Date('2025-03-01'),
          estimatedCompletionDate: new Date('2025-10-15'),
          contractAmount: '465000',
          budgetTotal: '465000',
          totalSpent: '0',
          totalInvoiced: '0',
          totalPaid: '0',
          squareFootage: 3100,
          bedrooms: 5,
          bathrooms: '4.0',
          stories: 2,
          garageSpaces: 3,
        },
        {
          tenantId: tenant.id,
          homeownerId: homeowner4.id,
          projectManagerId: pm2.id,
          projectNumber: 'VH-2024-004',
          name: 'Villarreal Residence - Treasure Hills',
          description: 'Mediterranean-style with courtyard',
          address: '4520 Treasure Hills Blvd, Lot 5',
          city: 'Harlingen',
          state: 'TX',
          zipCode: '78550',
          subdivision: 'Treasure Hills',
          lotNumber: '5',
          status: 'active',
          currentPhase: 'final_completion',
          contractDate: new Date('2024-06-01'),
          estimatedStartDate: new Date('2024-07-01'),
          estimatedCompletionDate: new Date('2025-01-15'),
          actualStartDate: new Date('2024-07-08'),
          contractAmount: '398000',
          budgetTotal: '398000',
          totalSpent: '391200',
          totalInvoiced: '398000',
          totalPaid: '358200',
          squareFootage: 2580,
          bedrooms: 4,
          bathrooms: '3.5',
          stories: 1,
          garageSpaces: 2,
          permitNumber: 'HAR-2024-RES-0623',
          permitIssueDate: new Date('2024-06-15'),
        },
      ])
      .returning();

    console.log('✅ Created 4 active projects');

    // Create project phases for each project
    console.log('📅 Creating project phases...');
    const DEFAULT_PHASES = [
      'pre_construction', 'site_prep', 'foundation', 'framing', 'roofing',
      'rough_in', 'insulation', 'drywall', 'interior_finish', 'exterior_finish',
      'final_completion', 'warranty_period'
    ];

    for (const project of [project1, project2, project3, project4]) {
      for (let i = 0; i < DEFAULT_PHASES.length; i++) {
        await db.insert(projectPhases).values({
          projectId: project.id,
          phase: DEFAULT_PHASES[i] as any,
          sortOrder: i,
          isActive: DEFAULT_PHASES[i] === project.currentPhase,
          isCompleted: i < DEFAULT_PHASES.indexOf(project.currentPhase || 'pre_construction'),
        });
      }
    }

    console.log('✅ Created phases for all projects');

    // Create sample tasks
    console.log('✅ Creating construction tasks...');
    await db.insert(tasks).values([
      {
        projectId: project1.id,
        title: 'Frame second floor walls',
        description: 'Complete framing for all second-floor exterior and interior walls',
        tradeId: tradesList.find(t => t.category === 'framing')?.id,
        assignedToId: fieldSuper.id,
        assignedSubcontractorId: framingSub.id,
        status: 'in_progress',
        priority: 'urgent',
        scheduledDate: new Date('2025-01-27'),
        estimatedHours: '32',
        estimatedCost: '8500',
        requiresInspection: true,
        sortOrder: 1,
      },
      {
        projectId: project1.id,
        title: 'Roof sheathing and felt',
        description: 'Install roof sheathing and weather barrier',
        tradeId: tradesList.find(t => t.category === 'roofing')?.id,
        assignedSubcontractorId: roofingSub.id,
        status: 'scheduled',
        priority: 'normal',
        scheduledDate: new Date('2025-02-03'),
        estimatedHours: '24',
        estimatedCost: '6200',
        requiresInspection: true,
        sortOrder: 2,
      },
      {
        projectId: project2.id,
        title: 'Rough-in plumbing inspection',
        description: 'Schedule and pass rough plumbing inspection',
        tradeId: tradesList.find(t => t.category === 'plumbing')?.id,
        assignedToId: pm1.id,
        assignedSubcontractorId: plumbingSub.id,
        status: 'inspection',
        priority: 'critical',
        scheduledDate: new Date('2025-01-30'),
        estimatedHours: '4',
        requiresInspection: true,
        inspectionStatus: 'scheduled',
        inspectionDate: new Date('2025-01-30'),
        sortOrder: 1,
      },
      {
        projectId: project2.id,
        title: 'Electrical rough-in',
        description: 'Complete all electrical rough-in work',
        tradeId: tradesList.find(t => t.category === 'electrical')?.id,
        assignedSubcontractorId: electricalSub.id,
        status: 'in_progress',
        priority: 'urgent',
        scheduledDate: new Date('2025-01-28'),
        estimatedHours: '40',
        estimatedCost: '12500',
        requiresInspection: true,
        sortOrder: 2,
      },
      {
        projectId: project4.id,
        title: 'Final walkthrough with homeowner',
        description: 'Complete final walkthrough and create punch list',
        assignedToId: pm2.id,
        status: 'scheduled',
        priority: 'normal',
        scheduledDate: new Date('2025-02-01'),
        estimatedHours: '2',
        sortOrder: 1,
      },
    ]);

    console.log('✅ Created 5 tasks');

    // Create sample communications
    console.log('📞 Creating communications...');
    await db.insert(communications).values([
      {
        tenantId: tenant.id,
        projectId: project1.id,
        homeownerId: homeowner1.id,
        type: 'call_inbound',
        direction: 'inbound',
        fromNumber: homeowner1.phone,
        toNumber: '(956) 428-3500',
        subject: 'Question about framing timeline',
        body: 'Homeowner called asking about second-floor framing schedule',
        durationSeconds: 420,
        status: 'completed',
        aiSummary: 'Homeowner inquired about framing timeline. Confirmed on track for Feb 3rd roof installation.',
        sentimentScore: '0.75',
        detectedRisk: false,
        requiresFollowUp: false,
        startedAt: new Date('2025-01-28T14:30:00'),
        endedAt: new Date('2025-01-28T14:37:00'),
      },
      {
        tenantId: tenant.id,
        projectId: project2.id,
        homeownerId: homeowner2.id,
        type: 'email_outbound',
        direction: 'outbound',
        fromEmail: 'maria.garcia@villahomes.ai',
        toEmail: homeowner2.email,
        subject: 'Plumbing Inspection Scheduled - Jan 30',
        body: 'Hi Sofia, Great news! Your rough plumbing inspection is scheduled for Thursday, January 30th at 10:00 AM. The inspector will verify all water lines, drains, and gas connections. This is a critical milestone before we can proceed with insulation.',
        status: 'completed',
        aiSummary: 'Inspection notification sent to homeowner',
        sentimentScore: '0.85',
        requiresFollowUp: false,
      },
      {
        tenantId: tenant.id,
        projectId: project1.id,
        subcontractorId: framingSub.id,
        type: 'sms_inbound',
        direction: 'inbound',
        fromNumber: '(956) 380-4422',
        toNumber: fieldSuper.phone,
        body: 'Crew will be 30 min late tomorrow. Lumber delivery delayed.',
        status: 'completed',
        aiSummary: 'Framing crew delayed 30 minutes due to lumber delivery',
        detectedRisk: true,
        riskSeverity: 'low',
        requiresFollowUp: false,
      },
    ]);

    console.log('✅ Created 3 communications');

    // Create budget line items
    console.log('💰 Creating budget line items...');
    await db.insert(budgetLineItems).values([
      {
        projectId: project1.id,
        category: 'land_cost',
        description: 'Lot 12 - Belmont Ridge',
        estimatedAmount: '75000',
        actualAmount: '75000',
        sortOrder: 1,
      },
      {
        projectId: project1.id,
        category: 'permits_fees',
        description: 'Building permits and impact fees',
        estimatedAmount: '8500',
        actualAmount: '8200',
        sortOrder: 2,
      },
      {
        projectId: project1.id,
        category: 'foundation',
        description: 'Slab foundation with post-tension',
        tradeId: tradesList.find(t => t.category === 'concrete')?.id,
        subcontractorId: concreteSub.id,
        estimatedAmount: '28000',
        actualAmount: '27800',
        committedAmount: '27800',
        poNumber: 'PO-1001',
        sortOrder: 3,
      },
      {
        projectId: project1.id,
        category: 'framing',
        description: 'Complete framing package',
        tradeId: tradesList.find(t => t.category === 'framing')?.id,
        subcontractorId: framingSub.id,
        estimatedAmount: '45000',
        actualAmount: '31200',
        committedAmount: '45000',
        poNumber: 'PO-1002',
        sortOrder: 4,
      },
      {
        projectId: project1.id,
        category: 'roofing',
        description: 'Architectural shingles - Brownstone',
        tradeId: tradesList.find(t => t.category === 'roofing')?.id,
        subcontractorId: roofingSub.id,
        estimatedAmount: '18500',
        committedAmount: '18500',
        poNumber: 'PO-1003',
        sortOrder: 5,
      },
    ]);

    console.log('✅ Created budget line items');

    console.log('\n🎉 Rio Grande Valley demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Tenant: ${tenant.name}`);
    console.log(`   • Team members: 5`);
    console.log(`   • Homeowners: 5`);
    console.log(`   • Active projects: 4`);
    console.log(`   • Subcontractors: 7`);
    console.log(`   • Trades: 13`);
    console.log(`   • Tasks: 5`);
    console.log(`   • Communications: 3`);
    console.log('\n🔑 Login credentials:');
    console.log(`   Email: carlos.martinez@villahomes.ai`);
    console.log(`   Password: Demo123!`);
    console.log('\n🚀 Ready for board presentation!');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRGVDemo()
    .then(() => {
      console.log('✅ Demo seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Demo seeding failed:', error);
      process.exit(1);
    });
}

export { seedRGVDemo };
