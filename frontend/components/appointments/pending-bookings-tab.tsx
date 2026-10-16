"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  getPendingBookings,
  reviewBooking,
  type BookingRequest,
} from "@/services/public-booking-service";
import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCreated(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: BookingRequest["statusCode"]) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 ring-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 ring-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600 ring-gray-200";
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
}

interface ReviewDialogState {
  booking: BookingRequest;
  action: "CONFIRMED" | "REJECTED";
}

export function PendingBookingsTab() {
  const queryClient = useQueryClient();
  const [reviewState, setReviewState] = React.useState<ReviewDialogState | null>(null);
  const [staffNotes, setStaffNotes] = React.useState("");
  const [reviewError, setReviewError] = React.useState<string | null>(null);

  const { data: bookings = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["pending-bookings"],
    queryFn: getPendingBookings,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: "CONFIRMED" | "REJECTED"; notes?: string }) =>
      reviewBooking(id, action, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pending-bookings"] });
      setReviewState(null);
      setStaffNotes("");
      setReviewError(null);
    },
    onError: (err) => {
      setReviewError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Review failed. Please retry.",
      );
    },
  });

  const openReview = (booking: BookingRequest, action: "CONFIRMED" | "REJECTED") => {
    setReviewState({ booking, action });
    setStaffNotes("");
    setReviewError(null);
  };

  const submitReview = () => {
    if (!reviewState) return;
    mutation.mutate({
      id: reviewState.booking.id,
      action: reviewState.action,
      notes: staffNotes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Online Booking Requests</h2>
          <p className="text-sm text-muted-foreground">
            Patients who booked via the public portal — confirm or reject each request.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pending bookings...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Failed to load booking requests. Check your connection and retry.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30 py-14 text-center">
          <CalendarCheck2 className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium text-muted-foreground">No pending booking requests</p>
            <p className="text-sm text-muted-foreground/70 mt-0.5">
              New requests from the public booking page will appear here.
            </p>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Share this link with patients:{" "}
            <span className="font-mono text-primary">
              {typeof window !== "undefined" ? window.location.origin : ""}/book-appointment
            </span>
          </p>
        </div>
      )}

      {/* Booking cards */}
      {!isLoading && bookings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.map((b) => (
            <Card key={b.id} className="rounded-2xl border bg-card shadow-sm">
              <CardContent className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm leading-tight">{b.patientName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.bookingRef}</p>
                  </div>
                  <Badge className={`text-[11px] ring-1 shrink-0 ${statusBadge(b.statusCode)}`}>
                    {b.statusCode}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{b.patientPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {formatDate(b.preferredDate)}
                      {b.preferredTime ? ` at ${b.preferredTime}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Received {formatCreated(b.createdAt)}</span>
                  </div>
                  {b.visitReason && (
                    <p className="rounded-lg bg-muted/60 px-2.5 py-1.5 leading-snug mt-1">
                      {b.visitReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {b.statusCode === "PENDING" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-8 flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openReview(b, "CONFIRMED")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => openReview(b, "REJECTED")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review confirmation dialog */}
      {reviewState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {reviewState.action === "CONFIRMED" ? "Confirm booking" : "Reject booking"}
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{reviewState.booking.patientName}</span>
              {" · "}
              {formatDate(reviewState.booking.preferredDate)}
              {reviewState.booking.preferredTime ? ` at ${reviewState.booking.preferredTime}` : ""}
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Notes to patient (optional)
              </label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder={
                  reviewState.action === "CONFIRMED"
                    ? "e.g. Please arrive 10 minutes early..."
                    : "e.g. No availability on that date, please call to reschedule..."
                }
                maxLength={500}
                className="w-full rounded-xl border bg-muted/40 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {reviewError && (
              <p className="text-sm text-destructive">{reviewError}</p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setReviewState(null); setReviewError(null); }}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={mutation.isPending}
                onClick={submitReview}
                className={
                  reviewState.action === "CONFIRMED"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving...</>
                ) : reviewState.action === "CONFIRMED" ? (
                  "Confirm booking"
                ) : (
                  "Reject booking"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
