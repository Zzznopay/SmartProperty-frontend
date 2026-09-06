// 运营 - 来访登记
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type VisitRecord = {
  id?: number;
  communityId: number;
  visitorName: string;
  visitorPhone?: string;
  visitReason?: string;
  visitTarget?: string;
  roomId?: number;
  visitTime: string;
  leaveTime?: string;
  visitorCount?: number;
  plateNo?: string;
  guardId?: number;
  guardName?: string;
  status?: number; // 1在访 2已离开
  remark?: string;
  createTime?: string;
};

export async function listVisitRecords(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/visit-records`, { method: 'GET', params });
}
export async function addVisitRecord(body: Partial<VisitRecord>) {
  return request(`${API_BASE}/operation/visit-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function leaveVisitRecord(id: number) {
  return request(`${API_BASE}/operation/visit-records/${id}/leave`, {
    method: 'POST',
  });
}
