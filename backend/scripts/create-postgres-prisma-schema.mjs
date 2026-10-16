import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const sourcePath = resolve(backendRoot, 'prisma', 'schema.prisma');
const targetPath = resolve(backendRoot, 'prisma-postgresql', 'schema.prisma');

const source = readFileSync(sourcePath, 'utf8');

const postgresSchema = source
  .replace(
    /provider\s*=\s*"mysql"/,
    'provider = "postgresql"',
  )
  .replace(
    /datasource db \{[\s\S]*?url\s*=\s*env\("DATABASE_URL"\)[\s\S]*?\}/,
    (match) => {
      // Ensure directUrl is present for Neon pgbouncer support
      if (!match.includes('directUrl')) {
        return match.replace(
          /url\s*=\s*env\("DATABASE_URL"\)/,
          'url       = env("DATABASE_URL")\n  directUrl = env("DATABASE_URL_DIRECT")',
        );
      }
      return match;
    },
  )
  .replace(/@db\.LongText\b/g, '@db.Text');

const header = `// AUTO-GENERATED from prisma/schema.prisma.
// Do not edit directly. Run \`npm run prisma:schema:postgres\` after changing
// the canonical MySQL schema. This schema keeps the same Prisma model names
// while switching the datasource provider to PostgreSQL for Render migration.

`;

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, `${header}${postgresSchema}`, 'utf8');

console.log(`Wrote PostgreSQL Prisma schema to ${targetPath}`);
