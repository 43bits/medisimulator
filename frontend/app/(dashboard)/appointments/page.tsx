"use client";

import * as React from "react";
import { CalendarDays, ClipboardList } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { PendingBookingsTab } from "@/components/appointments/pending-bookings-tab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useScope } from "@/providers/scope-provider";
import { useAuth } from "@/providers/auth-provider";

// Roles that can see and action online booking requests
const BOOKING_REVIEW_ROLES = new Set([
  "SUPER_ADMIN", "ADMIN", "FACILITY_ADMIN", "BRANCH_ADMIN",
  "DOCTOR", "CLINICIAN", "NURSE", "TRIAGE_NURSE",
]);

type Tab = "scheduled" | "online-requests";

export default function AppointmentsPage() {
  const { data, isLoading } = useAppointments();
  const { facilityName, selectedBranchName } = useScope();
  const { user } = useAuth();
  const [tab, setTab] = React.useState<Tab>("scheduled");

  const canReviewBookings = BOOKING_REVIEW_ROLES.has(user?.roleCode ?? "");
  const appointments = data ?? [];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-[2rem] border surface-spotlight shadow-md p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/5 to-transparent" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-module">
              Scheduling
            </Badge>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Appointments
                </h1>
                <p className="text-muted-foreground">
                  Clinical scheduling in the active scope
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md rounded-[1.5rem] border bg-background/70">
            <CardContent className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Facility</p>
                <p className="truncate font-semibold">
                  {facilityName || "No facility"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="truncate font-semibold">
                  {selectedBranchName || "No branch"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tabs — only show Online Requests tab to eligible roles */}
      {canReviewBookings && (
        <div className="flex gap-1 rounded-2xl border bg-muted/40 p-1 w-fit">
          <button
            onClick={() => setTab("scheduled")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === "scheduled"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Scheduled
          </button>
          <button
            onClick={() => setTab("online-requests")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === "online-requests"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Online Requests
          </button>
        </div>
      )}

      {/* Tab content */}
      {tab === "scheduled" || !canReviewBookings ? (
        <AppointmentsTable items={appointments} isLoading={isLoading} />
      ) : (
        <PendingBookingsTab />
      )}
    </div>
  );
}
