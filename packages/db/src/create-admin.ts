import { db } from './client.js';
import { tenants, users } from './schema/index.js';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';

// Generate a secure random password
function generateSecurePassword(length: number = 24): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+';
  const bytes = randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  
  return password;
}

// Argon2 options (same as auth.ts)
const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function createAdminAccount() {
  console.log('Creating admin account...\n');

  // Generate secure password
  const password = generateSecurePassword(24);
  
  // Admin credentials
  const adminEmail = 'admin@enterprise.local';
  const adminName = 'System Administrator';
  const tenantName = 'Enterprise Admin';
  const tenantSlug = 'enterprise-admin';

  try {
    // Check if tenant already exists
    const existingTenant = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
    });

    let tenantId: string;

    if (existingTenant) {
      console.log('Tenant already exists, using existing tenant...');
      tenantId = existingTenant.id;
    } else {
      // Create admin tenant
      const [tenant] = await db
        .insert(tenants)
        .values({
          name: tenantName,
          slug: tenantSlug,
          plan: 'enterprise',
          status: 'active',
          onboardingStep: 'complete',
          settings: {
            brandColor: '#8b5cf6',
            timezone: 'America/Chicago',
          },
        })
        .returning();
      
      tenantId = tenant.id;
      console.log(`Created tenant: ${tenant.name} (${tenant.slug})`);
    }

    // Check if admin user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq, and }) => 
        and(eq(users.email, adminEmail), eq(users.tenantId, tenantId)),
    });

    if (existingUser) {
      console.log('\n⚠️  Admin user already exists!');
      console.log(`Email: ${adminEmail}`);
      console.log('Please use the existing credentials or reset the password.');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hash(password, HASH_OPTIONS);

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        tenantId: tenantId,
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'admin',
        status: 'active',
        emailVerified: true,
      })
      .returning();

    console.log(`\n✅ Admin account created successfully!\n`);
    console.log('========================================');
    console.log('ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`Tenant:   ${tenantSlug}`);
    console.log('========================================');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('   This password will not be shown again.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
