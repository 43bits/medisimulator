import { apiFetch } from './api';

export interface DashboardStats {
  healthScore?: number | null;
  healthStatus?: string | null;
  openAlerts?: number | null;
  criticalAlerts?: number | null;
  warningAlerts?: number | null;
  activeAdmissions?: number | null;
  labQueue?: number | null;
}

export interface ModuleRecord {
  id: number;
  recordNumber?: string | null;
  title?: string | null;
  statusCode?: string | null;
  priorityCode?: string | null;
  workflowStage?: string | null;
  moduleSlug?: string | null;
  dueAt?: string | null;
  createdAt: string;
}

export interface ModuleStats {
  total?: number;
  inProgress?: number;
  completed?: number;
  overdue?: number;
  recentRecords?: ModuleRecord[];
}

export interface Notification {
  id: number;
  title: string;
  message?: string | null;
  severity?: string | null;
  notificationType?: string | null;
  isResolved: boolean;
  createdAt: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await apiFetch<DashboardStats>('/reports/dashboard/health');
  } catch {
    return {};
  }
}

export async function getModuleStats(): Promise<ModuleStats> {
  try {
    return await apiFetch<ModuleStats>('/operational-module/stats');
  } catch {
    return {};
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await apiFetch<{ data: Notification[] } | Notification[]>('/notifications?take=10&isResolved=false');
    return Array.isArray(data) ? data : (data as { data: Notification[] }).data ?? [];
  } catch {
    return [];
  }
}
