import { api } from '@/lib/api';
import type { DashboardMetrics } from '@/types';

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>('/dashboard');
  return data;
}
