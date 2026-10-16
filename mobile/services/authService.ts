import { apiFetch } from './api';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    fullName?: string | null;
    email?: string | null;
    roleId: number;
    roleCode?: string | null;
    role?: { id: number; code: string; name: string } | null;
  };
}

export interface MeResponse {
  id?: number;
  userId?: number;
  username: string;
  fullName?: string | null;
  email?: string | null;
  roleId?: number;
  roleCode?: string | null;
  role?: { id: number; code: string; name: string } | null;
  homeFacilityId?: number | null;
  homeBranchId?: number | null;
  homeFacility?: { id: number; name: string } | null;
  homeBranch?: { id: number; name: string } | null;
  canAccessAllBranchesInFacility?: boolean;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    token: '', // public — no token
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}
