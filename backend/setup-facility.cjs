/**
 * One-time setup script: creates a default facility + branch and assigns
 * all existing users to it so the system is usable after the initial seed.
 *
 * Run with: node setup-facility.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ── 1. Create facility (idempotent via upsert on code) ─────────────────
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
      subscriptionPaidThrough: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });
  console.log(`✅ Facility: id=${facility.id}  name="${facility.name}"`);

  // ── 2. Create a default branch inside the facility ──────────────────────
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
  console.log(`✅ Branch:   id=${branch.id}  name="${branch.name}"  facilityId=${branch.facilityId}`);

  // ── 3. Assign ALL users that still have no homeFacilityId ───────────────
  const updated = await prisma.user.updateMany({
    where: { homeFacilityId: null },
    data: {
      homeFacilityId: facility.id,
      homeBranchId: branch.id,
      canAccessAllBranchesInFacility: true,
    },
  });
  console.log(`✅ Updated ${updated.count} user(s) → homeFacilityId=${facility.id}, homeBranchId=${branch.id}`);

  // ── 4. Verify ───────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: { id: true, username: true, homeFacilityId: true, homeBranchId: true, role: { select: { code: true } } },
  });
  console.log('\n=== Final user state ===');
  users.forEach(u =>
    console.log(`  id=${u.id}  username="${u.username}"  role=${u.role?.code}  facilityId=${u.homeFacilityId}  branchId=${u.homeBranchId}`)
  );
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
