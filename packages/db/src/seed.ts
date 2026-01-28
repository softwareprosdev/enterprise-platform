import { db } from './client.js';
import { plans, tenants, users } from './schema/index.js';
import { hash } from '@node-rs/argon2';

async function seed() {
  console.log('Seeding database...');

  // Create billing plans
  const [freePlan, starterPlan, proPlan, enterprisePlan] = await db
    .insert(plans)
    .values([
      {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic features',
        price: '0',
        features: ['1 project', '2 team members', 'Basic support'],
        limits: { projects: 1, teamMembers: 2, clients: 5 },
        sortOrder: 0,
      },
      {
        name: 'Starter',
        slug: 'starter',
        description: 'Perfect for small teams',
        price: '49',
        features: [
          '10 projects',
          '5 team members',
          'Priority support',
          'Client portal',
          'Basic integrations',
        ],
        limits: { projects: 10, teamMembers: 5, clients: 25 },
        sortOrder: 1,
      },
      {
        name: 'Pro',
        slug: 'pro',
        description: 'For growing agencies',
        price: '149',
        features: [
          'Unlimited projects',
          '20 team members',
          'Premium support',
          'Advanced integrations',
          'Custom branding',
          'API access',
        ],
        limits: { projects: -1, teamMembers: 20, clients: -1 },
        sortOrder: 2,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For large organizations',
        price: '499',
        features: [
          'Unlimited everything',
          'Dedicated support',
          'Custom integrations',
          'SLA guarantee',
          'SSO/SAML',
          'Audit logs',
        ],
        limits: { projects: -1, teamMembers: -1, clients: -1 },
        sortOrder: 3,
      },
    ])
    .returning();

  console.log('Created plans:', [freePlan, starterPlan, proPlan, enterprisePlan].map((p) => p.name));

  // Create demo tenant
  const [demoTenant] = await db
    .insert(tenants)
    .values({
      name: 'Demo Agency',
      slug: 'demo',
      plan: 'pro',
      status: 'active',
      onboardingStep: 'complete',
      settings: {
        brandColor: '#8b5cf6',
        timezone: 'America/Chicago',
      },
    })
    .returning();

  console.log('Created tenant:', demoTenant.name);

  // Create demo user (password: demo123)
  const passwordHash = await hash('demo123', {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const [demoUser] = await db
    .insert(users)
    .values({
      tenantId: demoTenant.id,
      email: 'demo@enterprise.local',
      passwordHash,
      name: 'Demo User',
      role: 'owner',
      status: 'active',
      emailVerified: true,
    })
    .returning();

  console.log('Created user:', demoUser.email);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
