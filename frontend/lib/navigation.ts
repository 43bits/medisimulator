import {
  Activity, Ambulance, Baby, BedDouble, BriefcaseBusiness, CalendarPlus,
  Clock3, CreditCard, Dumbbell, FileCheck2, FlaskConical, HeartPulse,
  LayoutDashboard, Microscope, Monitor, Pill, Plus, Receipt, ScanLine,
  Settings, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Truck,
  UserPlus, Users, Warehouse, Network, Link2, type LucideIcon,
} from "lucide-react";

/**
 * Single navigation registry for the sidebar, command palette, and
 * breadcrumbs. `module` drives the per-family accent (data-module).
 */
export type ModuleFamily =
  | "clinical"
  | "diagnostics"
  | "pharmacy"
  | "finance"
  | "inpatient"
  | "operations"
  | "admin";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  allowedRoles?: string[];
};

export type NavSection = {
  label: string;
  module: ModuleFamily;
  items: NavItem[];
};

// ─── Role groupings used across nav items ───────────────────────────────────
const ALL_STAFF = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "RECEPTIONIST",
  "DOCTOR", "CLINICIAN", "NURSE", "TRIAGE_NURSE", "IPD_NURSE", "WARD_MANAGER",
  "LAB_TECHNICIAN", "LAB_MANAGER",
  "PHARMACIST", "PHARMACY_MANAGER",
  "CASHIER", "BILLING_OFFICER",
];
const CLINICAL = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "DOCTOR", "CLINICIAN", "NURSE", "TRIAGE_NURSE", "IPD_NURSE", "WARD_MANAGER",
];
const LAB = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "DOCTOR", "CLINICIAN", "LAB_TECHNICIAN", "LAB_MANAGER",
];
const PHARMACY = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "PHARMACIST", "PHARMACY_MANAGER",
];
const PHARMACY_AND_CASHIER = [
  ...PHARMACY, "CASHIER", "BILLING_OFFICER",
];
const FINANCE = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "CASHIER", "BILLING_OFFICER",
];
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN"];
const REPORTS_ROLES = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "LAB_MANAGER", "PHARMACY_MANAGER", "WARD_MANAGER",
];
const IPD_ROLES = [
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "DOCTOR", "CLINICIAN", "NURSE", "IPD_NURSE", "WARD_MANAGER",
];

export const navSections: NavSection[] = [
  {
    label: "Workspace",
    module: "clinical",
    items: [
      { title: "Command Center", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] },
      { title: "AI Assistant", href: "/ai-assistant", icon: Sparkles, keywords: ["gemini", "help"], allowedRoles: ALL_STAFF },
      { title: "Patients", href: "/patients", icon: Users, keywords: ["register", "records"], allowedRoles: ALL_STAFF },
      { title: "Appointments", href: "/appointments", icon: CalendarPlus, keywords: ["booking", "schedule"], allowedRoles: ALL_STAFF },
      { title: "Active Queue", href: "/queue", icon: Clock3, keywords: ["waiting", "checked in"], allowedRoles: CLINICAL },
    ],
  },
  {
    label: "Medical Care",
    module: "clinical",
    items: [
      { title: "Consultations", href: "/consultation", icon: Stethoscope, keywords: ["doctor", "encounter"], allowedRoles: CLINICAL },
      { title: "Triage & Vitals", href: "/triage", icon: HeartPulse, keywords: ["vitals", "nurse"], allowedRoles: ["SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN","TRIAGE_NURSE","NURSE","IPD_NURSE","DOCTOR","CLINICIAN"] },
      { title: "OPD Clinics", href: "/opd-clinics", icon: UserPlus, allowedRoles: CLINICAL },
      { title: "Admissions (IPD)", href: "/ipd", icon: BedDouble, keywords: ["wards", "beds", "inpatient"], allowedRoles: IPD_ROLES },
      { title: "Emergency", href: "/emergency", icon: Ambulance, allowedRoles: CLINICAL },
      { title: "Theatre", href: "/theatre", icon: Activity, keywords: ["surgery"], allowedRoles: ["SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN","DOCTOR","CLINICIAN"] },
      { title: "Maternity", href: "/maternity", icon: Baby, allowedRoles: ["SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN","DOCTOR","CLINICIAN","NURSE","IPD_NURSE"] },
    ],
  },
  {
    label: "Diagnostics",
    module: "diagnostics",
    items: [
      { title: "Laboratory", href: "/lab", icon: FlaskConical, keywords: ["tests", "results"], allowedRoles: LAB },
      { title: "Radiology", href: "/radiology", icon: Monitor, keywords: ["imaging", "xray"], allowedRoles: ["SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN","DOCTOR","CLINICIAN"] },
      { title: "Blood Bank", href: "/blood-bank", icon: ScanLine, allowedRoles: ["SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN","DOCTOR","CLINICIAN","NURSE"] },
    ],
  },
  {
    label: "Pharmacy & Inventory",
    module: "pharmacy",
    items: [
      { title: "Dispensing", href: "/pharmacy", icon: Pill, keywords: ["prescriptions", "medicines"], allowedRoles: PHARMACY },
      { title: "OTC Sales", href: "/pharmacy/otc-sales", icon: ShoppingCart, keywords: ["walk-in", "sale"], allowedRoles: PHARMACY_AND_CASHIER },
      { title: "Branch Stock", href: "/pharmacy-stock", icon: Warehouse, keywords: ["inventory"], allowedRoles: [...PHARMACY, "SUPER_ADMIN","ADMIN","FACILITY_ADMIN","BRANCH_ADMIN"] },
      { title: "Procurement", href: "/procurement", icon: Truck, keywords: ["purchase", "supplies"], allowedRoles: ADMIN_ROLES },
    ],
  },
  {
    label: "Revenue Cycle",
    module: "finance",
    items: [
      { title: "Billing & Cashier", href: "/billing", icon: CreditCard, keywords: ["payments", "mpesa", "cash"], allowedRoles: [...FINANCE, "DOCTOR","CLINICIAN"] },
      { title: "Invoices", href: "/invoices", icon: Receipt, allowedRoles: [...FINANCE, "DOCTOR","CLINICIAN"] },
      { title: "Insurance & Claims", href: "/insurance", icon: ShieldCheck, keywords: ["sha", "claims"], allowedRoles: ADMIN_ROLES },
    ],
  },
  {
    label: "Specialties",
    module: "operations",
    items: [
      { title: "Dental", href: "/dental", icon: Microscope, allowedRoles: CLINICAL },
      { title: "Physiotherapy", href: "/physiotherapy", icon: Dumbbell, allowedRoles: CLINICAL },
      { title: "Oncology", href: "/oncology", icon: Activity, allowedRoles: CLINICAL },
      { title: "Renal / Dialysis", href: "/renal-dialysis", icon: HeartPulse, allowedRoles: CLINICAL },
      { title: "Mental Health", href: "/mental-health", icon: HeartPulse, allowedRoles: CLINICAL },
    ],
  },
  {
    label: "Integrations",
    module: "operations",
    items: [
      { title: "Integration Hub", href: "/integration", icon: Network, keywords: ["dha", "sha", "kra", "api"], allowedRoles: ADMIN_ROLES },
      { title: "Sync Status", href: "/integration/sync", icon: Link2, keywords: ["sync", "errors"], allowedRoles: ADMIN_ROLES },
    ],
  },
  {
    label: "System",
    module: "admin",
    items: [
      { title: "Medical Records", href: "/medical-records", icon: FileCheck2, allowedRoles: ADMIN_ROLES },
      { title: "Analytics & Reports", href: "/reports", icon: Activity, keywords: ["dashboard", "export"], allowedRoles: REPORTS_ROLES },
      { title: "Human Resources", href: "/hr", icon: BriefcaseBusiness, allowedRoles: ADMIN_ROLES },
      { title: "Settings", href: "/settings", icon: Settings, adminOnly: true },
      { title: "Platform Control", href: "/platform", icon: ShieldCheck, superAdminOnly: true },
    ],
  },
];

export const quickActions: NavItem[] = [
  { title: "New Patient", href: "/patients/new", icon: UserPlus },
  { title: "New Appointment", href: "/appointments/new", icon: CalendarPlus },
  { title: "New Invoice", href: "/billing/invoices", icon: Plus },
];

export function visibleNavSections(roleCode: string): NavSection[] {
  const canManageSettings = ["SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN"].includes(
    roleCode,
  );
  const isSuperAdmin = roleCode === "SUPER_ADMIN";

  return navSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !item.adminOnly || canManageSettings)
        .filter((item) => !item.superAdminOnly || isSuperAdmin)
        .filter(
          (item) => !item.allowedRoles || item.allowedRoles.includes(roleCode),
        ),
    }))
    .filter((section) => section.items.length > 0);
}

/** Module family for the current pathname (drives data-module accents). */
export function moduleForPath(pathname: string): ModuleFamily {
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return section.module;
      }
    }
  }
  return "clinical";
}
