// 运营 - 消防演练
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type FireDrill = {
  id?: number;
  communityId?: number;
  drillName: string;
  drillType: number; // 1灭火演练 2疏散演练 3综合演练
  drillDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  participantCount?: number;
  drillContent?: string;
  drillSummary?: string;
  organizer?: string;
  status?: number; // 1计划中 2进行中 3已完成
  remark?: string;
  createTime?: string;
};

export async function listFireDrills(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/fire-drills`, { method: 'GET', params });
}
export async function getFireDrill(id: number) {
  return request<FireDrill>(`${API_BASE}/operation/fire-drills/${id}`, {
    method: 'GET',
  });
}
export async function addFireDrill(body: Partial<FireDrill>) {
  return request(`${API_BASE}/operation/fire-drills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateFireDrill(id: number, body: Partial<FireDrill>) {
  return request<FireDrill>(`${API_BASE}/operation/fire-drills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteFireDrill(id: number) {
  return request(`${API_BASE}/operation/fire-drills/${id}`, { method: 'DELETE' });
}
