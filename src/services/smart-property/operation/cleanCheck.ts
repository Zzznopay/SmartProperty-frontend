// 运营 - 清洁检查
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CleanCheck = {
  id?: number;
  communityId?: number;
  arrangeId?: number;
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

export async function listCleanChecks(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/clean-checks`, { method: 'GET', params });
}
export async function getCleanCheck(id: number) {
  return request<CleanCheck>(`${API_BASE}/operation/clean-checks/${id}`, {
    method: 'GET',
  });
}
export async function addCleanCheck(body: Partial<CleanCheck>) {
  return request(`${API_BASE}/operation/clean-checks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCleanCheck(id: number, body: Partial<CleanCheck>) {
  return request<CleanCheck>(`${API_BASE}/operation/clean-checks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteCleanCheck(id: number) {
  return request(`${API_BASE}/operation/clean-checks/${id}`, { method: 'DELETE' });
}
