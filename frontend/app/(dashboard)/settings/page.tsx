"use client";

import { SettingsManager } from "@/components/settings/settings-manager";
import { RoleGuard } from "@/components/shared/role-guard";

const SETTINGS_ROLES = ["SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN"];

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={SETTINGS_ROLES}>
      <SettingsManager
        title="Hospital Settings"
        badge="Workspace Configuration"
      />
    </RoleGuard>
  );
}
