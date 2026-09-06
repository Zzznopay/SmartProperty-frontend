// 房产 - 验房记录
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CheckRecord = {
  id?: number;
  roomId?: number;
  roomNo?: string;
  ownerId?: number;
  ownerName?: string;
  checkType?: 1 | 2;
  checkDate: string;
  checkResult?: 1 | 2;
  problems?: string;
  status?: 1 | 2;
  remark?: string;
  createTime?: string;
};

export async function listCheckRecords(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/check-records`, { method: 'GET', params });
}
export async function addCheckRecord(body: Partial<CheckRecord>) {
  return request<CheckRecord>(`${API_BASE}/property/check-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function completeCheck(id: number, body: { remark?: string }) {
  return request(`${API_BASE}/property/check-records/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
