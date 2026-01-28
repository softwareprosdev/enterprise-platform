import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
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

  // tRPC handler
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(`tRPC error on ${path}:`, error);
      },
    },
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await fastify.close();
      await redis.quit();
      process.exit(0);
    });
  });

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`API server running at http://${HOST}:${PORT}`);
    console.log(`tRPC endpoint: http://${HOST}:${PORT}/trpc`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
