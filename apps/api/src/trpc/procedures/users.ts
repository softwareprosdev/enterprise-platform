import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc.js';
import { userUpdateSchema, userInviteSchema, paginationSchema, generateId } from '@enterprise/shared';
import { users, invitations } from '@enterprise/db/schema';
import { eq, and, desc } from '@enterprise/db';

export const usersRouter = router({
  // List team members
  list: protectedProcedure.input(paginationSchema.optional()).query(async ({ ctx, input }) => {
    const { page = 1, pageSize = 20 } = input || {};
    const offset = (page - 1) * pageSize;

    const teamMembers = await ctx.db.query.users.findMany({
      where: eq(users.tenantId, ctx.tenant.id),
      orderBy: [desc(users.createdAt)],
      limit: pageSize,
      offset,
    });

    const total = await ctx.db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.tenantId, ctx.tenant.id));

    return {
      items: teamMembers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      total: total.length,
      page,
      pageSize,
      totalPages: Math.ceil(total.length / pageSize),
    };
  }),

  // Get single user
  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }),

  // Update current user profile
  updateProfile: protectedProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id))
      .returning();

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar: updated.avatar,
    };
  }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(['admin', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input;

      // Can't change owner's role
      const targetUser = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, userId), eq(users.tenantId, ctx.tenant.id)),
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (targetUser.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Cannot change the owner's role",
        });
      }

      const [updated] = await ctx.db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      return { id: updated.id, role: updated.role };
    }),

  // Invite user
  invite: adminProcedure.input(userInviteSchema).mutation(async ({ ctx, input }) => {
    const { email, role } = input;

    // Check if user already exists
    const existingUser = await ctx.db.query.users.findFirst({
      where: and(eq(users.email, email.toLowerCase()), eq(users.tenantId, ctx.tenant.id)),
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This user is already a member of this workspace',
      });
    }

    // Check for pending invitation
    const existingInvite = await ctx.db.query.invitations.findFirst({
      where: and(
        eq(invitations.email, email.toLowerCase()),
        eq(invitations.tenantId, ctx.tenant.id)
      ),
    });

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'An invitation has already been sent to this email',
      });
    }

    // Create invitation
    const token = generateId(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await ctx.db
      .insert(invitations)
      .values({
        tenantId: ctx.tenant.id,
        email: email.toLowerCase(),
        role,
        token,
        invitedById: ctx.user.id,
        expiresAt,
      })
      .returning();

    // TODO: Send invitation email

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }),

  // Remove user from team
  remove: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      // Can't remove yourself
      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot remove yourself',
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, userId), eq(users.tenantId, ctx.tenant.id)),
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Can't remove owner
      if (targetUser.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove the workspace owner',
        });
      }

      await ctx.db.delete(users).where(eq(users.id, userId));

      return { success: true };
    }),
});
