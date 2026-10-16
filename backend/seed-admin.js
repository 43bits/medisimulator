const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: { code: 'ADMIN', name: 'ADMIN', description: 'System Administrator', isSystem: true, isActive: true }
  });

  const hash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: {},
    create: {
      email: 'admin@hms.com',
      username: 'admin',
      passwordHash: hash,
      fullName: 'System Admin',
      isActive: true,
      canAccessAllBranchesInFacility: true,
      roleId: role.id
    }
  });

  console.log('DONE', user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());