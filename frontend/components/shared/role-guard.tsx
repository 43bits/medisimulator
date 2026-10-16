"use client";

import * as React from "react";
import { ShieldOff } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface RoleGuardProps {
  /** Roles that ARE allowed to see this content. */
  allowedRoles: string[];
  /** Optional: override the default "access denied" UI. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps any page or section that should only be visible to certain roles.
 * Renders a clean "Access restricted" card for everyone else.
 *
 * Usage:
 *   <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN"]}>
 *     <SettingsManager />
 *   </RoleGuard>
 */
export function RoleGuard({ allowedRoles, fallback, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  // While auth is loading, don't flash the access-denied UI
  if (isLoading) return null;

  const roleCode = user?.roleCode ?? "";
  const isAllowed = allowedRoles.includes(roleCode);

  if (!isAllowed) {
    return (
      fallback ?? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <ShieldOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Access restricted</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your role{roleCode ? ` (${roleCode.replace(/_/g, " ")})` : ""} does
              not have permission to access this section. Contact your
              administrator if you need access.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
