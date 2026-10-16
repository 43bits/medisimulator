import { apiFetch } from './api';
import type { BookingRequest } from './bookingService';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  appointmentDate: string;
  startTime?: string | null;
  visitReason?: string | null;
  statusCode: string;
  patientId: number;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    patientNumber: string;
    phonePrimary?: string | null;
    gender?: string | null;
  } | null;
  doctor?: {
    id: number;
    firstName: string;
    lastName: string;
    designation?: string | null;
  } | null;
  createdAt: string;
}

export interface AppointmentsResponse {
  data: Appointment[];
  total?: number;
}

export async function getAppointments(params?: {
  take?: number;
  skip?: number;
  date?: string;
}): Promise<Appointment[]> {
  const qs = new URLSearchParams();
  if (params?.take) qs.set('take', String(params.take));
  if (params?.skip) qs.set('skip', String(params.skip));
  if (params?.date) qs.set('date', params.date);
  const query = qs.toString() ? `?${qs}` : '';
  const result = await apiFetch<AppointmentsResponse | Appointment[]>(`/appointments${query}`);
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getPendingBookings(): Promise<BookingRequest[]> {
  return apiFetch<BookingRequest[]>('/public-booking/pending');
}

export async function reviewBooking(
  id: number,
  action: 'CONFIRMED' | 'REJECTED',
  staffNotes?: string,
): Promise<BookingRequest> {
  return apiFetch<BookingRequest>(`/public-booking/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ action, staffNotes }),
  });
}
