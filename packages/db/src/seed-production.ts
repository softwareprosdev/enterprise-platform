/**
 * Production Database Seeding Script
 * Seeds essential data for Villa Homes platform
 * Run with: pnpm --filter @enterprise/db seed:prod
 */

import { db } from './index.js';
import { trades, plans } from './schema/index.js';

async function seedProduction() {
  console.log('🌱 Seeding production database...');

  try {
    // Seed construction trades
    console.log('📋 Seeding trades...');
    const tradesList = [
      { name: 'General Contractor', category: 'general_contractor', description: 'Overall project management and coordination', typicalDurationDays: null, sortOrder: 1 },
      { name: 'Excavation', category: 'excavation', description: 'Site preparation and excavation', typicalDurationDays: 5, sortOrder: 2 },
      { name: 'Concrete & Foundation', category: 'concrete', description: 'Foundation and concrete work', typicalDurationDays: 10, sortOrder: 3 },
      { name: 'Framing', category: 'framing', description: 'Structural framing', typicalDurationDays: 15, sortOrder: 4 },
      { name: 'Roofing', category: 'roofing', description: 'Roof installation', typicalDurationDays: 7, sortOrder: 5 },
      { name: 'Plumbing', category: 'plumbing', description: 'Plumbing rough-in and finish', typicalDurationDays: 10, sortOrder: 6 },
      { name: 'Electrical', category: 'electrical', description: 'Electrical rough-in and finish', typicalDurationDays: 10, sortOrder: 7 },
      { name: 'HVAC', category: 'hvac', description: 'Heating, ventilation, and air conditioning', typicalDurationDays: 8, sortOrder: 8 },
      { name: 'Insulation', category: 'insulation', description: 'Insulation installation', typicalDurationDays: 3, sortOrder: 9 },
      { name: 'Drywall', category: 'drywall', description: 'Drywall installation and finishing', typicalDurationDays: 10, sortOrder: 10 },
      { name: 'Painting', category: 'painting', description: 'Interior and exterior painting', typicalDurationDays: 7, sortOrder: 11 },
      { name: 'Flooring', category: 'flooring', description: 'Flooring installation', typicalDurationDays: 5, sortOrder: 12 },
      { name: 'Cabinets & Countertops', category: 'cabinets', description: 'Kitchen and bathroom cabinets', typicalDurationDays: 5, sortOrder: 13 },
      { name: 'Windows & Doors', category: 'windows_doors', description: 'Window and door installation', typicalDurationDays: 5, sortOrder: 14 },
      { name: 'Appliances', category: 'appliances', description: 'Appliance installation', typicalDurationDays: 2, sortOrder: 15 },
      { name: 'Landscaping', category: 'landscaping', description: 'Landscaping and exterior work', typicalDurationDays: 7, sortOrder: 16 },
      { name: 'Final Cleaning', category: 'cleaning', description: 'Final cleaning and touch-ups', typicalDurationDays: 2, sortOrder: 17 },
    ];

    // Note: trades need tenantId, so this should be run after first tenant is created
    // For now, we'll create a system tenant or skip this
    console.log('⚠️  Trades seeding skipped - will be created per tenant on first use');

    // Seed subscription plans
    console.log('💳 Seeding subscription plans...');
    const plansList = [
      {
        name: 'Free Trial',
        slug: 'free',
        description: 'Perfect for getting started',
        price: '0',
        currency: 'usd',
        interval: 'month' as const,
        features: JSON.stringify([
          '1 active project',
          '2 team members',
          '5 clients',
          'Basic reporting',
          '14-day trial',
        ]),
        limits: JSON.stringify({
          projects: 1,
          teamMembers: 2,
          clients: 5,
        }),
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Starter',
        slug: 'starter',
        description: 'For small construction companies',
        price: '49',
        currency: 'usd',
        interval: 'month' as const,
        features: JSON.stringify([
          '5 active projects',
          '5 team members',
          '25 clients',
          'Advanced reporting',
          'Email support',
          'Mobile app access',
        ]),
        limits: JSON.stringify({
          projects: 5,
          teamMembers: 5,
          clients: 25,
        }),
        isActive: true,
        sortOrder: 2,
        stripePriceId: process.env.STRIPE_PRICE_STARTER || null,
      },
      {
        name: 'Professional',
        slug: 'pro',
        description: 'For growing construction businesses',
        price: '149',
        currency: 'usd',
        interval: 'month' as const,
        features: JSON.stringify([
          '20 active projects',
          '15 team members',
          'Unlimited clients',
          'Advanced analytics',
          'Priority support',
          'API access',
          'Custom branding',
          'Subcontractor portal',
        ]),
        limits: JSON.stringify({
          projects: 20,
          teamMembers: 15,
          clients: -1, // unlimited
        }),
        isActive: true,
        sortOrder: 3,
        stripePriceId: process.env.STRIPE_PRICE_PRO || null,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For large construction operations',
        price: '499',
        currency: 'usd',
        interval: 'month' as const,
        features: JSON.stringify([
          'Unlimited projects',
          'Unlimited team members',
          'Unlimited clients',
          'White-label solution',
          'Dedicated support',
          'Custom integrations',
          'Advanced security',
          'SLA guarantee',
          'Training & onboarding',
        ]),
        limits: JSON.stringify({
          projects: -1, // unlimited
          teamMembers: -1, // unlimited
          clients: -1, // unlimited
        }),
        isActive: true,
        sortOrder: 4,
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
      },
    ];

    for (const plan of plansList) {
      await db.insert(plans).values(plan).onConflictDoNothing();
    }

    console.log('✅ Production database seeded successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Register your first user at /auth/register');
    console.log('2. Complete onboarding flow');
    console.log('3. Trades will be auto-created for your tenant');
    console.log('4. Configure Stripe if using billing features');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProduction()
    .then(() => {
      console.log('✅ Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedProduction };
