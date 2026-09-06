// 运营 - 绿化检查
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type GreeneryCheck = {
  id?: number;
  communityId?: number;
  checkDate?: string;
  areaName: string;
  checkResult: number; // 1合格 2不合格
  score?: number;
  problems?: string;
  checkerId?: number;
  checkerName?: string;
  remark?: string;
  createTime?: string;
};

export async function listGreeneryChecks(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/greenery-checks`, { method: 'GET', params });
}
export async function getGreeneryCheck(id: number) {
  return request<GreeneryCheck>(`${API_BASE}/operation/greenery-checks/${id}`, {
    method: 'GET',
  });
}
export async function addGreeneryCheck(body: Partial<GreeneryCheck>) {
  return request(`${API_BASE}/operation/greenery-checks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateGreeneryCheck(id: number, body: Partial<GreeneryCheck>) {
  return request<GreeneryCheck>(`${API_BASE}/operation/greenery-checks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteGreeneryCheck(id: number) {
  return request(`${API_BASE}/operation/greenery-checks/${id}`, { method: 'DELETE' });
}
