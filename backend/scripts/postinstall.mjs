/**
 * postinstall.mjs
 * Generates the correct Prisma client depending on DATABASE_PROVIDER.
 *   mysql / undefined  → prisma/schema.prisma          (local dev)
 *   postgresql/postgres → prisma-postgresql/schema.prisma (Render/Neon)
 */
import { execSync } from 'node:child_process';

const provider = (process.env.DATABASE_PROVIDER || 'mysql').trim().toLowerCase();
const isPostgres = provider === 'postgresql' || provider === 'postgres';

const schema = isPostgres
  ? 'prisma-postgresql/schema.prisma'
  : 'prisma/schema.prisma';

console.log(`[postinstall] Generating Prisma client for schema: ${schema}`);

try {
  execSync(`npx prisma generate --schema ${schema}`, { stdio: 'inherit' });
} catch (err) {
  console.error('[postinstall] prisma generate failed:', err.message);
  process.exit(1);
}
