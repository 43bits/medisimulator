import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
}

function parseOriginList(value?: string) {
  return (value ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
}

function buildAllowedOrigins(configService: ConfigService) {
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const origins = [
    ...parseOriginList(configService.get<string>('FRONTEND_URL')),
    ...parseOriginList(configService.get<string>('FRONTEND_ORIGINS')),
  ];
  if (nodeEnv !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:3001');
  }
  return Array.from(new Set(origins));
}

function getPort(configService: ConfigService): number {
  const port = Number(configService.get<string>('PORT') ?? 3000);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  // ── Security headers ──────────────────────────────────────────────────────
  const adapter = app.getHttpAdapter().getInstance();
  adapter.disable('x-powered-by');
  const trustProxy = String(configService.get('TRUST_PROXY') || '').toLowerCase() === 'true';
  if (trustProxy) adapter.set('trust proxy', 1);

  // ── Body parsing ──────────────────────────────────────────────────────────
  const bodyLimit = configService.get<string>('BODY_LIMIT') || '4mb';
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // ── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = buildAllowedOrigins(configService);
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin))) return cb(null, true);
      return cb(new Error('CORS origin not allowed'), false);
    },
    credentials: true,
  });

  // ── HTTP hardening middleware ──────────────────────────────────────────────
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (configService.get('NODE_ENV') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // ── Validation ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
    }),
  );

  // ── /health endpoint ─────────────────────────────────────────────────────
  // Mounted directly on Express so it bypasses all NestJS guards and responds
  // even when the app is booting. Used by Render health checks and cron pingers.
  adapter.get('/health', async (_req: any, res: any) => {
    try {
      const dbOk = await prisma.isHealthy();
      const status = dbOk ? 'ok' : 'degraded';
      res.status(dbOk ? 200 : 503).json({
        status,
        db: dbOk ? 'connected' : 'unreachable',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        env: configService.get('NODE_ENV') ?? 'unknown',
      });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        db: 'unreachable',
        message: err instanceof Error ? err.message : 'unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ── Shutdown hooks ────────────────────────────────────────────────────────
  app.enableShutdownHooks();
  // Render sends SIGTERM — give in-flight requests up to 10 s to finish
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — shutting down gracefully');
    await app.close();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });

  // ── Listen on 0.0.0.0 (required by Render) ───────────────────────────────
  const port = getPort(configService);
  await app.listen(port, '0.0.0.0');
  logger.log(`Application listening on 0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
