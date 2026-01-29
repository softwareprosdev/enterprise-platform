import { router } from './trpc.js';

// Auth procedures
import { authRouter } from './procedures/auth.js';
import { tenantsRouter } from './procedures/tenants.js';
import { usersRouter } from './procedures/users.js';
import { homeownersRouter } from './procedures/homeowners.js';
import { subcontractorsRouter, tradesRouter } from './procedures/subcontractors.js';
import { communicationsRouter } from './procedures/communications.js';
import { projectsRouter } from './procedures/projects.js';
import { tasksRouter } from './procedures/tasks.js';
import { onboardingRouter } from './procedures/onboarding.js';
import { billingRouter } from './procedures/billing.js';
import { dashboardRouter } from './procedures/dashboard.js';

// Re-export from trpc.ts for backwards compatibility
export { router, publicProcedure, protectedProcedure, adminProcedure, ownerProcedure } from './trpc.js';

// Root router
export const appRouter = router({
  auth: authRouter,
  tenants: tenantsRouter,
  users: usersRouter,
  homeowners: homeownersRouter,
  subcontractors: subcontractorsRouter,
  trades: tradesRouter,
  communications: communicationsRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  onboarding: onboardingRouter,
  billing: billingRouter,
  dashboard: dashboardRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
