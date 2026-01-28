import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '@enterprise/db';
import { users, sessions, tenants } from '@enterprise/db/schema';
import { eq } from '@enterprise/db';
import type { AuthUser, Tenant } from '@enterprise/shared';

export interface Context {
  db: typeof db;
  user: AuthUser | null;
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'plan' | 'status'> | null;
  sessionId: string | null;
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
}

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<Context> {
  // Get session token from cookie or header
  const sessionToken =
    req.cookies?.['session'] || req.headers.authorization?.replace('Bearer ', '');

  let user: AuthUser | null = null;
  let tenant: Context['tenant'] = null;
  let sessionId: string | null = null;

  if (sessionToken) {
    try {
      // Look up session in database
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionToken),
      });

      if (session && session.expiresAt > new Date()) {
        const userResult = await db.query.users.findFirst({
          where: eq(users.id, session.userId),
        });

        if (userResult && userResult.status === 'active') {
          const tenantResult = await db.query.tenants.findFirst({
            where: eq(tenants.id, userResult.tenantId),
          });

          if (tenantResult && tenantResult.status !== 'suspended') {
            sessionId = session.id;

            user = {
              id: userResult.id,
              tenantId: userResult.tenantId,
              email: userResult.email,
              name: userResult.name,
              avatar: userResult.avatar,
              role: userResult.role,
              mfaEnabled: userResult.mfaEnabled,
            };

            tenant = {
              id: tenantResult.id,
              name: tenantResult.name,
              slug: tenantResult.slug,
              plan: tenantResult.plan ?? 'free',
              status: tenantResult.status,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error validating session:', error);
    }
  }

  return {
    db,
    user,
    tenant,
    sessionId,
    req,
    res,
  };
}

export type ContextType = Awaited<ReturnType<typeof createContext>>;
