/**
 * seed-all-roles.mjs
 * Creates all system roles and a test user for each role.
 * Password for every user: password123
 * Username = lowercase role code (e.g. DOCTOR → doctor)
 * Run: node scripts/seed-all-roles.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  { code: 'SUPER_ADMIN',       name: 'Super Admin',        description: 'Platform-wide super administrator' },
  { code: 'ADMIN',             name: 'Admin',               description: 'Platform administrator' },
  { code: 'FACILITY_ADMIN',    name: 'Facility Admin',      description: 'Manages an entire facility' },
  { code: 'BRANCH_ADMIN',      name: 'Branch Admin',        description: 'Manages a single branch' },
  { code: 'DOCTOR',            name: 'Doctor',              description: 'Clinical doctor / physician' },
  { code: 'CLINICIAN',         name: 'Clinician',           description: 'Non-MD clinician (same as Doctor)' },
  { code: 'NURSE',             name: 'Nurse',               description: 'General nurse' },
  { code: 'TRIAGE_NURSE',      name: 'Triage Nurse',        description: 'Performs triage assessments' },
  { code: 'IPD_NURSE',         name: 'IPD Nurse',           description: 'Inpatient department nurse' },
  { code: 'WARD_MANAGER',      name: 'Ward Manager',        description: 'Manages ward operations' },
  { code: 'LAB_TECHNICIAN',    name: 'Lab Technician',      description: 'Enters lab results' },
  { code: 'LAB_MANAGER',       name: 'Lab Manager',         description: 'Verifies and manages lab results' },
  { code: 'PHARMACIST',        name: 'Pharmacist',          description: 'Dispenses prescriptions and OTC sales' },
  { code: 'PHARMACY_MANAGER',  name: 'Pharmacy Manager',    description: 'Manages pharmacy operations' },
  { code: 'CASHIER',           name: 'Cashier',             description: 'Collects payments at billing' },
  { code: 'BILLING_OFFICER',   name: 'Billing Officer',     description: 'Handles billing and invoices' },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('🔄  Seeding roles and users...\n');

  for (const roleDef of ROLES) {
    // 1. Upsert the role
    const role = await prisma.role.upsert({
      where:  { code: roleDef.code },
      update: { name: roleDef.name, description: roleDef.description },
      create: {
        code:        roleDef.code,
        name:        roleDef.name,
        description: roleDef.description,
        isSystem:    true,
        isActive:    true,
      },
    });

    // 2. Build username: lowercase role code, underscores kept
    //    e.g. SUPER_ADMIN → super_admin, LAB_TECHNICIAN → lab_technician
    const username = roleDef.code.toLowerCase();
    const email    = `${username}@hms.com`;
    const fullName = roleDef.name;

    // 3. Upsert the user — only create if not already there, never overwrite existing passwords
    const user = await prisma.user.upsert({
      where:  { username },
      update: {}, // do not touch existing users
      create: {
        username,
        email,
        passwordHash,
        fullName,
        isActive:                      true,
        canAccessAllBranchesInFacility: true,
        roleId:                         role.id,
      },
    });

    console.log(`  ✅  ${roleDef.code.padEnd(18)}  username: ${username.padEnd(18)}  user.id: ${user.id}`);
  }

  console.log('\n✅  Done! All roles and users are seeded.');
  console.log('   Password for every user: password123');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
