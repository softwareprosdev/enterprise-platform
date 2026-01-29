/**
 * Add Madeira Brownsville Development and expand demo data
 * Run with: pnpm --filter @enterprise/db seed:madeira
 */

import { db } from './index.js';
import { 
  tenants, users, homeowners, projects, projectPhases, tasks, 
  subcontractors, trades, communications, budgetLineItems, clients
} from './schema/index.js';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

const HASH_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

// RGV Names for realistic data
const FIRST_NAMES = ['Carlos', 'Maria', 'Jose', 'Ana', 'Miguel', 'Rosa', 'Juan', 'Elena', 'Roberto', 'Carmen', 'Francisco', 'Patricia', 'Antonio', 'Lucia', 'Manuel', 'Sofia', 'Ricardo', 'Isabella', 'Fernando', 'Gabriela', 'Luis', 'Valentina', 'Diego', 'Camila', 'Alejandro', 'Daniela', 'Eduardo', 'Mariana', 'Sergio', 'Andrea', 'Rafael', 'Paula', 'Oscar', 'Natalia', 'Hector', 'Laura', 'Arturo', 'Monica', 'Enrique', 'Adriana'];
const LAST_NAMES = ['Garcia', 'Martinez', 'Rodriguez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutierrez', 'Chavez', 'Ramos', 'Vargas', 'Castillo', 'Jimenez', 'Ruiz', 'Mendoza', 'Aguilar', 'Medina', 'Castro', 'Vasquez', 'Salazar', 'Delgado', 'Pena', 'Soto', 'Sandoval', 'Contreras', 'Guerrero', 'Estrada', 'Nunez', 'Herrera'];

const CITIES = [
  { city: 'Brownsville', zip: '78520' },
  { city: 'Harlingen', zip: '78550' },
  { city: 'McAllen', zip: '78501' },
  { city: 'Edinburg', zip: '78539' },
  { city: 'Mission', zip: '78572' },
  { city: 'Pharr', zip: '78577' },
  { city: 'Weslaco', zip: '78596' },
  { city: 'San Benito', zip: '78586' },
  { city: 'Mercedes', zip: '78570' },
  { city: 'South Padre Island', zip: '78597' },
];

const STREETS = ['Palm Blvd', 'Resaca Dr', 'Bougainvillea Ln', 'Citrus Ave', 'Ocean View Dr', 'Laguna Vista Rd', 'Rio Grande Blvd', 'Mesquite St', 'Hibiscus Cir', 'Sunset Blvd', 'Gulf Breeze Ln', 'Tropical Way', 'Pelican Dr', 'Seabreeze Ave', 'Marina Blvd', 'Flamingo Ln', 'Paradise Rd', 'Sandpiper Ct', 'Dolphin Way', 'Coastal Hwy'];

const SUBDIVISIONS = ['Madeira at Brownsville', 'Belmont Ridge', 'Palm Valley Estates', 'Resaca Heights', 'Treasure Hills', 'Las Palmas', 'Cimarron Country', 'Sharyland Plantation', 'Tres Lagos', 'La Joya Estates'];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `(956) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

async function seedMadeiraAndMore() {
  console.log('🌱 Adding Madeira Brownsville and expanding demo data...\n');

  try {
    // Get existing tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, 'villa-homes-rgv'),
    });

    if (!tenant) {
      console.log('❌ Villa Homes RGV tenant not found. Run seed:demo first.');
      process.exit(1);
    }

    console.log(`✅ Found tenant: ${tenant.name}`);

    // Get existing users for assignment
    const existingUsers = await db.query.users.findMany({
      where: eq(users.tenantId, tenant.id),
    });
    const projectManagers = existingUsers.filter(u => u.role === 'project_manager' || u.role === 'owner');
    
    // Get existing trades
    const existingTrades = await db.query.trades.findMany({
      where: eq(trades.tenantId, tenant.id),
    });

    // Get existing subcontractors
    const existingSubs = await db.query.subcontractors.findMany({
      where: eq(subcontractors.tenantId, tenant.id),
    });

    const passwordHash = await hash('Demo123!', HASH_OPTIONS);

    // Add more team members (10 more)
    console.log('\n👥 Adding more team members...');
    const newTeamMembers = [];
    for (let i = 0; i < 10; i++) {
      const firstName = random(FIRST_NAMES);
      const lastName = random(LAST_NAMES);
      newTeamMembers.push({
        tenantId: tenant.id,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@villahomes.ai`,
        passwordHash,
        name: `${firstName} ${lastName}`,
        role: random(['project_manager', 'office_staff', 'field_staff'] as const),
        status: 'active' as const,
        emailVerified: true,
        phone: generatePhone(),
        title: random(['Project Manager', 'Site Superintendent', 'Estimator', 'Project Coordinator', 'Field Inspector']),
      });
    }
    await db.insert(users).values(newTeamMembers).onConflictDoNothing();
    console.log(`✅ Added ${newTeamMembers.length} team members`);

    // Add more homeowners (45 more to reach 50 total)
    console.log('\n🏠 Adding more homeowners...');
    const newHomeowners = [];
    for (let i = 0; i < 45; i++) {
      const firstName = random(FIRST_NAMES);
      const lastName = random(LAST_NAMES);
      const city = random(CITIES);
      const contractAmount = randomInt(280000, 2500000);
      
      newHomeowners.push({
        tenantId: tenant.id,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
        phone: generatePhone(),
        mobilePhone: generatePhone(),
        currentAddress: `${randomInt(100, 9999)} ${random(STREETS)}, ${city.city}, TX ${city.zip}`,
        status: random(['inquiry', 'contracted', 'construction', 'punch_list', 'completed', 'warranty'] as const),
        contractAmount: String(contractAmount),
        leadSource: random(['referral', 'website', 'showroom', 'social_media', 'realtor']),
        portalEnabled: Math.random() > 0.3,
        preferredContactMethod: random(['phone', 'email', 'text']),
        communicationFrequency: random(['daily', 'weekly', 'milestone']),
      });
    }
    await db.insert(homeowners).values(newHomeowners).onConflictDoNothing();
    console.log(`✅ Added ${newHomeowners.length} homeowners`);

    // Get all homeowners for project assignment
    const allHomeowners = await db.query.homeowners.findMany({
      where: eq(homeowners.tenantId, tenant.id),
    });

    // Add Madeira at Brownsville - Flagship $125M Development
    console.log('\n🏗️ Creating Madeira at Brownsville flagship project...');
    const [madeiraProject] = await db.insert(projects).values({
      tenantId: tenant.id,
      projectManagerId: projectManagers[0]?.id,
      projectNumber: 'VH-2024-MADEIRA-001',
      name: 'Madeira at Brownsville - Master Planned Community',
      description: 'Premier master-planned luxury community featuring 850 custom homes, resort-style amenities, 18-hole championship golf course, and commercial village center. Phase 1 includes 125 estate lots ranging from $450K to $2.5M.',
      address: '4500 Madeira Boulevard',
      city: 'Brownsville',
      state: 'TX',
      zipCode: '78520',
      subdivision: 'Madeira at Brownsville',
      status: 'active',
      currentPhase: 'site_prep',
      contractDate: new Date('2024-06-01'),
      estimatedStartDate: new Date('2024-06-15'),
      estimatedCompletionDate: new Date('2027-12-31'),
      actualStartDate: new Date('2024-06-20'),
      contractAmount: '125000000',
      budgetTotal: '98000000',
      totalSpent: '12500000',
      totalInvoiced: '15000000',
      totalPaid: '15000000',
      squareFootage: 2500000,
      permitNumber: 'BWN-2024-DEV-0001',
      permitIssueDate: new Date('2024-06-10'),
    }).returning();
    console.log('✅ Created Madeira at Brownsville - $125M');

    // Add Azure Tower South Padre - $85M Beachfront Condos
    const [azureProject] = await db.insert(projects).values({
      tenantId: tenant.id,
      projectManagerId: projectManagers[1]?.id || projectManagers[0]?.id,
      projectNumber: 'VH-2024-AZURE-001',
      name: 'Azure Tower - South Padre Island',
      description: '22-story luxury beachfront condominium tower with 180 units, rooftop infinity pool, private beach access, full-service spa, and underground parking for 400 vehicles.',
      address: '3200 Gulf Boulevard',
      city: 'South Padre Island',
      state: 'TX',
      zipCode: '78597',
      status: 'active',
      currentPhase: 'foundation',
      contractDate: new Date('2024-03-15'),
      estimatedStartDate: new Date('2024-04-01'),
      estimatedCompletionDate: new Date('2026-08-31'),
      actualStartDate: new Date('2024-04-05'),
      contractAmount: '85000000',
      budgetTotal: '68000000',
      totalSpent: '18500000',
      totalInvoiced: '22000000',
      totalPaid: '22000000',
      squareFootage: 425000,
      stories: 22,
      permitNumber: 'SPI-2024-COM-0012',
      permitIssueDate: new Date('2024-03-28'),
    }).returning();
    console.log('✅ Created Azure Tower South Padre - $85M');

    // Add Valley Medical Plaza - $65M Medical Complex
    const [medicalProject] = await db.insert(projects).values({
      tenantId: tenant.id,
      projectManagerId: projectManagers[0]?.id,
      projectNumber: 'VH-2024-MED-001',
      name: 'Valley Medical Plaza',
      description: 'State-of-the-art medical office complex with ambulatory surgical center, advanced imaging facility, and 12 specialty clinic suites. LEED Gold certified design.',
      address: '5800 N. 10th Street',
      city: 'McAllen',
      state: 'TX',
      zipCode: '78504',
      status: 'active',
      currentPhase: 'framing',
      contractDate: new Date('2024-01-10'),
      estimatedStartDate: new Date('2024-02-01'),
      estimatedCompletionDate: new Date('2025-11-30'),
      actualStartDate: new Date('2024-02-05'),
      contractAmount: '65000000',
      budgetTotal: '52000000',
      totalSpent: '28000000',
      totalInvoiced: '32500000',
      totalPaid: '32500000',
      squareFootage: 185000,
      stories: 4,
      permitNumber: 'MCA-2024-COM-0045',
      permitIssueDate: new Date('2024-01-25'),
    }).returning();
    console.log('✅ Created Valley Medical Plaza - $65M');

    // Add 47 more residential projects to reach 50+ total
    console.log('\n🏠 Adding more residential projects...');
    let totalProjectValue = 125000000 + 85000000 + 65000000; // Start with big 3
    const projectTypes = [
      { name: 'Custom Home - Luxury', minPrice: 850000, maxPrice: 2500000 },
      { name: 'Custom Home - Executive', minPrice: 450000, maxPrice: 850000 },
      { name: 'Custom Home - Standard', minPrice: 285000, maxPrice: 450000 },
      { name: 'Pool Home - Premium', minPrice: 550000, maxPrice: 1200000 },
      { name: 'Waterfront Estate', minPrice: 1500000, maxPrice: 4500000 },
    ];

    const newProjects = [];
    for (let i = 0; i < 47; i++) {
      const projectType = random(projectTypes);
      const contractAmount = randomInt(projectType.minPrice, projectType.maxPrice);
      const city = random(CITIES);
      const subdivision = random(SUBDIVISIONS);
      const homeowner = random(allHomeowners);
      const pm = random(projectManagers);
      const status = random(['planning', 'active', 'active', 'active', 'completed'] as const);
      const phases = ['pre_construction', 'site_prep', 'foundation', 'framing', 'roofing', 'rough_in', 'insulation', 'drywall', 'interior_finish', 'exterior_finish', 'final_completion'] as const;
      const currentPhase = status === 'completed' ? 'final_completion' : status === 'planning' ? 'pre_construction' : random([...phases]);
      
      const startDate = new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + randomInt(120, 365) * 24 * 60 * 60 * 1000);
      const spent = status === 'completed' ? contractAmount * 0.95 : contractAmount * (Math.random() * 0.7);

      newProjects.push({
        tenantId: tenant.id,
        homeownerId: homeowner.id,
        projectManagerId: pm?.id,
        projectNumber: `VH-2024-${String(i + 10).padStart(3, '0')}`,
        name: `${homeowner.lastName} Residence - ${subdivision}`,
        description: `${projectType.name} in ${subdivision}`,
        address: `${randomInt(100, 9999)} ${random(STREETS)}, Lot ${randomInt(1, 99)}`,
        city: city.city,
        state: 'TX',
        zipCode: city.zip,
        subdivision,
        lotNumber: String(randomInt(1, 150)),
        status,
        currentPhase,
        contractDate: startDate,
        estimatedStartDate: startDate,
        estimatedCompletionDate: endDate,
        actualStartDate: status !== 'planning' ? startDate : null,
        actualCompletionDate: status === 'completed' ? endDate : null,
        contractAmount: String(contractAmount),
        budgetTotal: String(contractAmount),
        totalSpent: String(Math.round(spent)),
        totalInvoiced: String(Math.round(spent * 0.9)),
        totalPaid: String(Math.round(spent * 0.85)),
        squareFootage: randomInt(1800, 5500),
        bedrooms: randomInt(3, 6),
        bathrooms: String(randomInt(2, 5) + 0.5),
        stories: randomInt(1, 2),
        garageSpaces: randomInt(2, 4),
      });
      
      totalProjectValue += contractAmount;
    }
    
    await db.insert(projects).values(newProjects).onConflictDoNothing();
    console.log(`✅ Added ${newProjects.length} residential projects`);

    // Add commercial clients
    console.log('\n🏢 Adding commercial clients...');
    const commercialClients = [
      { company: 'Valley Baptist Medical Center', industry: 'Healthcare' },
      { company: 'DHR Health System', industry: 'Healthcare' },
      { company: 'H-E-B Development', industry: 'Retail' },
      { company: 'McAllen ISD', industry: 'Education' },
      { company: 'UTRGV Facilities', industry: 'Education' },
      { company: 'Bert Ogden Auto Group', industry: 'Automotive' },
      { company: 'First Community Bank', industry: 'Financial' },
      { company: 'Marriott Hotels RGV', industry: 'Hospitality' },
      { company: 'Amazon Logistics', industry: 'Logistics' },
      { company: 'SpaceX Starbase', industry: 'Aerospace' },
    ];

    const clientData = commercialClients.map(c => ({
      tenantId: tenant.id,
      companyName: c.company,
      contactName: `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`,
      email: `contact@${c.company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: generatePhone(),
      status: 'active' as const,
      industry: c.industry,
    }));
    await db.insert(clients).values(clientData).onConflictDoNothing();
    console.log(`✅ Added ${clientData.length} commercial clients`);

    // Add project phases for new major projects
    console.log('\n📅 Creating project phases...');
    const DEFAULT_PHASES = [
      'pre_construction', 'site_prep', 'foundation', 'framing', 'roofing',
      'rough_in', 'insulation', 'drywall', 'interior_finish', 'exterior_finish',
      'final_completion', 'warranty_period'
    ] as const;

    for (const project of [madeiraProject, azureProject, medicalProject]) {
      for (let i = 0; i < DEFAULT_PHASES.length; i++) {
        await db.insert(projectPhases).values({
          projectId: project.id,
          phase: DEFAULT_PHASES[i],
          sortOrder: i,
          isActive: DEFAULT_PHASES[i] === project.currentPhase,
          isCompleted: i < DEFAULT_PHASES.indexOf(project.currentPhase as any),
        }).onConflictDoNothing();
      }
    }
    console.log('✅ Created phases for major projects');

    // Add budget line items for Madeira
    console.log('\n💰 Creating budget for Madeira project...');
    await db.insert(budgetLineItems).values([
      { projectId: madeiraProject.id, category: 'land_cost', description: 'Land acquisition - 450 acres', estimatedAmount: '18500000', actualAmount: '18500000', sortOrder: 1 },
      { projectId: madeiraProject.id, category: 'permits_fees', description: 'Development permits and impact fees', estimatedAmount: '2500000', actualAmount: '2200000', sortOrder: 2 },
      { projectId: madeiraProject.id, category: 'site_prep', description: 'Mass grading and infrastructure', estimatedAmount: '12000000', actualAmount: '8500000', sortOrder: 3 },
      { projectId: madeiraProject.id, category: 'foundation', description: 'Phase 1 foundations (125 lots)', estimatedAmount: '8500000', sortOrder: 4 },
      { projectId: madeiraProject.id, category: 'mechanical', description: 'Utility infrastructure', estimatedAmount: '15000000', actualAmount: '3200000', sortOrder: 5 },
      { projectId: madeiraProject.id, category: 'landscaping', description: 'Golf course and amenity landscaping', estimatedAmount: '8500000', sortOrder: 6 },
      { projectId: madeiraProject.id, category: 'overhead', description: 'Project management and overhead', estimatedAmount: '9800000', actualAmount: '1200000', sortOrder: 7 },
    ]).onConflictDoNothing();
    console.log('✅ Created Madeira budget items');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 VILLA HOMES DEMO DATA EXPANDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   • Total Project Value: $${(totalProjectValue / 1000000).toFixed(0)}M+`);
    console.log(`   • Major Projects:`);
    console.log(`     - Madeira at Brownsville: $125M`);
    console.log(`     - Azure Tower South Padre: $85M`);
    console.log(`     - Valley Medical Plaza: $65M`);
    console.log(`   • Additional residential projects: ${newProjects.length}`);
    console.log(`   • Additional homeowners: ${newHomeowners.length}`);
    console.log(`   • Commercial clients: ${clientData.length}`);
    console.log(`   • Additional team members: ${newTeamMembers.length}`);
    console.log('\n🔑 Login: carlos.martinez@villahomes.ai / Demo123!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

seedMadeiraAndMore()
  .then(() => {
    console.log('\n✅ Expansion complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
