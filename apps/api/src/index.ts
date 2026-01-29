import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { renderTrpcPanel } from 'trpc-panel';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/context.js';
import { redis } from './lib/redis.js';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
const HOST = process.env.API_HOST || '0.0.0.0';
const isDev = process.env.NODE_ENV !== 'production';

async function main() {
  const fastify = Fastify({
    logger: {
      level: isDev ? 'info' : 'warn',
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
    },
    maxParamLength: 5000,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Cookies
  await fastify.register(cookie, {
    secret: process.env.AUTH_SECRET || 'development-secret-change-in-production',
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis,
  });

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Add content type parser for tRPC requests
  fastify.addContentTypeParser(
    ['application/json', 'application/json; charset=utf-8'],
    { parseAs: 'string' },
    function (_, body, _done) {
      try {
        const json = typeof body === 'string' ? JSON.parse(body) : body;
        return json;
      } catch {
        return body;
      }
    }
  );

  // tRPC handler
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({ error, path }: { error: Error; path: string | undefined }) => {
        console.error(`tRPC error on ${path}:`, error);
      },
    },
  });

  // tRPC Panel - API documentation UI
  if (isDev) {
    fastify.get('/panel', async (_, reply) => {
      const panelHtml = renderTrpcPanel(appRouter, {
        url: `http://localhost:${PORT}/trpc`,
        transformer: 'superjson',
      });
      reply.type('text/html').send(panelHtml);
    });
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'] as const;
  for (const signal of signals) {
    process.on(signal, async () => {
      fastify.log.warn(`Received ${signal}, shutting down gracefully...`);
      await fastify.close();
      await redis.quit();
      process.exit(0);
    });
  }

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`API server running at http://${HOST}:${PORT}`);
    fastify.log.info(`tRPC endpoint: http://${HOST}:${PORT}/trpc`);
    if (isDev) {
      fastify.log.info(`tRPC Panel: http://${HOST}:${PORT}/panel`);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
