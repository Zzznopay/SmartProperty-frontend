// 运营 - 清洁安排
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CleanArrange = {
  id?: number;
  communityId?: number;
  areaName: string;
  cleanType: number; // 1日常 2定期 3专项
  arrangeDate?: string;
  startTime?: string;
  endTime?: string;
  cleanerId?: number;
  cleanerName?: string;
  status?: number; // 1待执行 2执行中 3已完成
  completeTime?: string;
  remark?: string;
  createTime?: string;
};

export async function listCleanArranges(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/clean-arranges`, { method: 'GET', params });
}
export async function addCleanArrange(body: Partial<CleanArrange>) {
  return request(`${API_BASE}/operation/clean-arranges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function completeCleanArrange(id: number) {
  return request(`${API_BASE}/operation/clean-arranges/${id}/complete`, {
    method: 'POST',
  });
}
export async function deleteCleanArrange(id: number) {
  return request(`${API_BASE}/operation/clean-arranges/${id}`, { method: 'DELETE' });
}
