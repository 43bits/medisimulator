import { apiFetch } from './api';

export interface Patient {
  id: number;
  patientNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  phonePrimary?: string | null;
  email?: string | null;
  isActive: boolean;
  facilityId: number;
  createdAt: string;
}

export interface PatientsResponse {
  data: Patient[];
  total?: number;
}

export async function getPatients(params?: {
  search?: string;
  take?: number;
  skip?: number;
}): Promise<{ data: Patient[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.take)   qs.set('take', String(params.take));
  if (params?.skip)   qs.set('skip', String(params.skip));
  const query = qs.toString() ? `?${qs}` : '';
  const result = await apiFetch<PatientsResponse | Patient[]>(`/patients${query}`);
  if (Array.isArray(result)) return { data: result, total: result.length };
  return { data: result.data ?? [], total: result.total ?? 0 };
}

export async function getPatient(id: number): Promise<Patient> {
  return apiFetch<Patient>(`/patients/${id}`);
}
