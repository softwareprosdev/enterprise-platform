import { router } from './trpc.js';

// Auth procedures
import { authRouter } from './procedures/auth.js';
import { tenantsRouter } from './procedures/tenants.js';
import { usersRouter } from './procedures/users.js';
import { clientsRouter } from './procedures/clients.js';
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
  clients: clientsRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  onboarding: onboardingRouter,
  billing: billingRouter,
  dashboard: dashboardRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
