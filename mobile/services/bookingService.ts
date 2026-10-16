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
  statusCode: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  staffNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}
