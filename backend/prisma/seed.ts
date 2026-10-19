import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create or Update the Role first
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'ADMIN',
      description: 'System Administrator',
      isSystem: true,
      isActive: true,
    },
  });

  // 2. Create a default Facility so all users have a home facility
  const facility = await prisma.facility.upsert({
    where: { code: 'FAC001' },
    update: {},
    create: {
      code: 'FAC001',
      name: 'Invinceible Core Hospital',
      facilityType: 'HOSPITAL',
      isActive: true,
      subscriptionStatus: 'ACTIVE',
      subscriptionStartedAt: new Date(),
      subscriptionPaidThrough: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Facility: id=${facility.id}  name="${facility.name}"`);

  // 3. Create a default Branch inside the facility
  const branch = await prisma.branch.upsert({
    where: { code: 'BR001' },
    update: {},
    create: {
      code: 'BR001',
      name: 'Main Branch',
      facilityId: facility.id,
      isActive: true,
    },
  });
  console.log(`✅ Branch:   id=${branch.id}  name="${branch.name}"`);

  // 4. Create or Update the Admin User — with home facility assigned
  await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: {},
    create: {
      email: 'admin@hms.com',
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: 'System Admin',
      isActive: true,
      canAccessAllBranchesInFacility: true,
      roleId: adminRole.id,
      homeFacilityId: facility.id,
      homeBranchId: branch.id,
    },
  });

  console.log('✅ Seed successful! Admin user created with facility assigned.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
