import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@enterprise/api/src/trpc/router';

// Create tRPC React hooks
export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

// Create tRPC client
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/trpc',
        transformer: superjson,
      }),
    ],
  });
}

// Create Query client with defaults
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
