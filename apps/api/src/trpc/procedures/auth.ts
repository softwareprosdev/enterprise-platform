import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { generateId } from '@enterprise/shared';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import {
  loginSchema,
  registerSchema,
  mfaVerifySchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from '@enterprise/shared';
import { users, sessions, tenants, verificationTokens } from '@enterprise/db/schema';
import { eq } from '@enterprise/db';
import { sessionStore } from '../../lib/redis.js';
import { createTOTPKeyURI, TOTPController } from 'oslo/otp';

const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Argon2 options
const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const authRouter = router({
  // Login with email and password
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    // Find user by email (need to check all tenants)
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
      with: {
        tenant: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Verify password
    const isValidPassword = await verify(user.passwordHash, password, HASH_OPTIONS);
    if (!isValidPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Create a temporary token for MFA verification
      const mfaToken = generateId(32);
      await sessionStore.set(`mfa:${mfaToken}`, user.id, 300); // 5 minutes

      return {
        requiresMfa: true,
        mfaToken,
      };
    }

    // Create session
    const sessionId = generateId(32);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

    await ctx.db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'] || null,
    });

    // Update last login
    await ctx.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Set cookie
    (ctx.res as any).setCookie('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });

    return {
      requiresMfa: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
    };
  }),

  // Request password reset
  requestPasswordReset: publicProcedure
    .input(passwordResetRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (!user) {
        return { success: true };
      }

      const resetToken = generateId(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await ctx.db.insert(verificationTokens).values({
        userId: user.id,
        token: resetToken,
        type: 'password_reset',
        expiresAt,
      });

      // TODO: send email. For demo, return token.
      return { success: true, resetToken };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(passwordResetSchema)
    .mutation(async ({ ctx, input }) => {
      const tokenRecord = await ctx.db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.token, input.token),
      });

      if (!tokenRecord || tokenRecord.type !== 'password_reset') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid reset token',
        });
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reset token expired',
        });
      }

      const passwordHash = await hash(input.password, HASH_OPTIONS);

      await ctx.db.update(users).set({ passwordHash }).where(eq(users.id, tokenRecord.userId));
      await ctx.db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRecord.id));

      return { success: true };
    }),

  // Register new user and tenant
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const { name, email, password, tenantName, tenantSlug } = input;

    // Check if email already exists
    const existingUser = await ctx.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'An account with this email already exists',
      });
    }

    // Check if tenant slug already exists
    const existingTenant = await ctx.db.query.tenants.findFirst({
      where: eq(tenants.slug, tenantSlug.toLowerCase()),
    });

    if (existingTenant) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This workspace URL is already taken',
      });
    }

    // Hash password
    const passwordHash = await hash(password, HASH_OPTIONS);

    // Create tenant and user in transaction
    const [tenant] = await ctx.db
      .insert(tenants)
      .values({
        name: tenantName,
        slug: tenantSlug.toLowerCase(),
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      })
      .returning();

    const [user] = await ctx.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'owner',
        status: 'active',
      })
      .returning();

    // Create session
    const sessionId = generateId(32);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

    await ctx.db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'] || null,
    });

    // Set cookie
    (ctx.res as any).setCookie('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  }),

  // Verify MFA code
  verifyMfa: publicProcedure
    .input(
      z.object({
        mfaToken: z.string(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { mfaToken, code } = input;

      // Get user ID from MFA token
      const userId = await sessionStore.get(`mfa:${mfaToken}`);
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'MFA session expired. Please login again.',
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          tenant: true,
        },
      });

      if (!user || !user.mfaSecret) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid MFA session',
        });
      }

      // Verify TOTP code
      const totp = new TOTPController();
      const isValid = await totp.verify(code, Buffer.from(user.mfaSecret, 'base64'));

      if (!isValid) {
        // Check backup codes
        const backupCodes = (user.backupCodes as string[]) || [];
        const codeIndex = backupCodes.indexOf(code);

        if (codeIndex === -1) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid verification code',
          });
        }

        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await ctx.db.update(users).set({ backupCodes }).where(eq(users.id, user.id));
      }

      // Delete MFA token
      await sessionStore.delete(`mfa:${mfaToken}`);

      // Create session
      const sessionId = generateId(32);
      const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

      await ctx.db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'] || null,
      });

      // Update last login
      await ctx.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

      // Set cookie
      (ctx.res as any).setCookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION_SECONDS,
        path: '/',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        },
      };
    }),

  // Logout
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.sessionId) {
      await ctx.db.delete(sessions).where(eq(sessions.id, ctx.sessionId));
    }

    (ctx.res as any).clearCookie('session', { path: '/' });

    return { success: true };
  }),

  // Get current session
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || !ctx.tenant) {
      return null;
    }

    return {
      user: ctx.user,
      tenant: ctx.tenant,
    };
  }),

  // Setup MFA
  setupMfa: protectedProcedure.mutation(async ({ ctx }) => {
    const secret = randomBytes(20);
    const secretBase64 = secret.toString('base64');

    // Generate TOTP URI
    const uri = createTOTPKeyURI('Enterprise', ctx.user.email, secret);

    // Store secret temporarily (not enabled yet)
    await sessionStore.set(`mfa-setup:${ctx.user.id}`, secretBase64, 600); // 10 minutes

    return {
      secret: secretBase64,
      uri,
    };
  }),

  // Enable MFA
  enableMfa: protectedProcedure.input(mfaVerifySchema).mutation(async ({ ctx, input }) => {
    const { code } = input;

    // Get pending MFA secret
    const secret = await sessionStore.get(`mfa-setup:${ctx.user.id}`);
    if (!secret) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'MFA setup session expired. Please try again.',
      });
    }

    // Verify code
    const totp = new TOTPController();
    const isValid = await totp.verify(code, Buffer.from(secret, 'base64'));

    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid verification code',
      });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => generateId(8).toUpperCase());

    // Enable MFA
    await ctx.db
      .update(users)
      .set({
        mfaSecret: secret,
        mfaEnabled: true,
        backupCodes,
      })
      .where(eq(users.id, ctx.user.id));

    // Delete setup session
    await sessionStore.delete(`mfa-setup:${ctx.user.id}`);

    return {
      backupCodes,
    };
  }),

  // Disable MFA
  disableMfa: protectedProcedure.input(mfaVerifySchema).mutation(async ({ ctx, input }) => {
    const { code } = input;

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user || !user.mfaSecret) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'MFA is not enabled',
      });
    }

    // Verify code
    const totp = new TOTPController();
    const isValid = await totp.verify(code, Buffer.from(user.mfaSecret, 'base64'));

    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid verification code',
      });
    }

    // Disable MFA
    await ctx.db
      .update(users)
      .set({
        mfaSecret: null,
        mfaEnabled: false,
        backupCodes: [],
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),
});
