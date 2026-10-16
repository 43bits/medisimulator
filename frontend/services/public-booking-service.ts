import { apiFetch } from "@/lib/api";

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface BookingRequest {
  id: number;
  bookingRef: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;
  preferredDate: string;
  preferredTime?: string | null;
  visitReason?: string | null;
  notes?: string | null;
  statusCode: BookingStatus;
  staffNotes?: string | null;
  reviewedAt?: string | null;
  facilityId?: number | null;
  createdAt: string;
}

export interface SubmitBookingPayload {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  preferredDate: string;
  preferredTime?: string;
  visitReason?: string;
  notes?: string;
  facilityId?: number;
}

export interface SubmitBookingResult {
  bookingRef: string;
  patientName: string;
  preferredDate: string;
  statusCode: string;
  message: string;
}

/** Public — no auth token needed */
export async function submitBookingRequest(
  payload: SubmitBookingPayload,
): Promise<SubmitBookingResult> {
  return apiFetch<SubmitBookingResult>("/public-booking", {
    method: "POST",
    body: JSON.stringify(payload),
    token: "", // explicitly pass empty so no stored token is used
  });
}

/** Staff — requires JWT */
export async function getPendingBookings(): Promise<BookingRequest[]> {
  return apiFetch<BookingRequest[]>("/public-booking/pending");
}

export async function getAllBookings(
  status?: BookingStatus,
): Promise<BookingRequest[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<BookingRequest[]>(`/public-booking${qs}`);
}

export async function reviewBooking(
  id: number,
  action: "CONFIRMED" | "REJECTED",
  staffNotes?: string,
): Promise<BookingRequest> {
  return apiFetch<BookingRequest>(`/public-booking/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ action, staffNotes }),
  });
}
