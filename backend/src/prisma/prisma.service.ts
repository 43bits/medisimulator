import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Neon Postgres serverless connections can drop after a period of inactivity.
 * This service wraps PrismaClient with exponential-backoff reconnect logic so
 * that the first request after a Neon cold-start doesn't surface a 5xx to the
 * caller — it just retries transparently.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private static readonly MAX_RETRIES = 5;
  private static readonly BASE_DELAY_MS = 250;

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Kept for backwards-compat with old call sites in main.ts */
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // ── Connection helpers ────────────────────────────────────────────────────

  private async connectWithRetry(): Promise<void> {
    for (let attempt = 1; attempt <= PrismaService.MAX_RETRIES; attempt++) {
      try {
        await this.$connect();
        if (attempt > 1) {
          this.logger.log(`Database connected on attempt ${attempt}`);
        }
        return;
      } catch (err) {
        const isLastAttempt = attempt === PrismaService.MAX_RETRIES;
        if (isLastAttempt) {
          this.logger.error(
            `Database connection failed after ${PrismaService.MAX_RETRIES} attempts`,
            err instanceof Error ? err.stack : String(err),
          );
          throw err;
        }
        const delay = PrismaService.BASE_DELAY_MS * 2 ** (attempt - 1);
        this.logger.warn(
          `Database connection attempt ${attempt} failed — retrying in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Execute a query with automatic retry on transient Neon/connection errors.
   * Use this for any critical single query where you want retry semantics
   * without wrapping the whole service call.
   */
  async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= PrismaService.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (!this.isRetryableError(err) || attempt === PrismaService.MAX_RETRIES) {
          throw err;
        }
        const delay = PrismaService.BASE_DELAY_MS * 2 ** (attempt - 1);
        this.logger.warn(
          `Transient DB error on attempt ${attempt} — retrying in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Re-connect before next attempt
        try { await this.$connect(); } catch { /* ignore */ }
      }
    }
    throw new Error('withRetry: exceeded max attempts'); // unreachable but satisfies TS
  }

  private isRetryableError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    // Neon connection reset, Prisma connection pool timeout, ETIMEDOUT
    return (
      msg.includes('connection') ||
      msg.includes('etimedout') ||
      msg.includes('econnreset') ||
      msg.includes('econnrefused') ||
      msg.includes('timed out') ||
      msg.includes('prepared statement') // Neon pgbouncer statement issue
    );
  }

  // ── Health probe ──────────────────────────────────────────────────────────

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
