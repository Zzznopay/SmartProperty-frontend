// 运营 - 执勤记录
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type DutyRecord = {
  id?: number;
  communityId: number;
  dutyDate: string;
  startTime?: string;
  endTime?: string;
  position?: string;
  securityId?: number;
  securityName?: string;
  dutyContent?: string;
  abnormalInfo?: string;
  status?: number; // 1正常 2异常
  remark?: string;
  createTime?: string;
};

export async function listDutyRecords(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/duty-records`, { method: 'GET', params });
}
export async function getDutyRecord(id: number) {
  return request<DutyRecord>(`${API_BASE}/operation/duty-records/${id}`, {
    method: 'GET',
  });
}
export async function addDutyRecord(body: Partial<DutyRecord>) {
  return request(`${API_BASE}/operation/duty-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateDutyRecord(id: number, body: Partial<DutyRecord>) {
  return request<DutyRecord>(`${API_BASE}/operation/duty-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteDutyRecord(id: number) {
  return request(`${API_BASE}/operation/duty-records/${id}`, { method: 'DELETE' });
}
