// 运营 - 规章制度
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Regulation = {
  id?: number;
  title: string;
  content: string;
  category?: string;
  fileUrl?: string;
  fileName?: string;
  isPublish?: number; // 0否 1是
  publishTime?: string;
  viewCount?: number;
  status?: number; // 1草稿 2已发布
  remark?: string;
  createTime?: string;
};

export async function listRegulations(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/regulations`, { method: 'GET', params });
}
export async function getRegulation(id: number) {
  return request<Regulation>(`${API_BASE}/admin/regulations/${id}`, {
    method: 'GET',
  });
}
export async function addRegulation(body: Partial<Regulation>) {
  return request<Regulation>(`${API_BASE}/admin/regulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function publishRegulation(id: number) {
  return request(`${API_BASE}/admin/regulations/${id}/publish`, { method: 'POST' });
}
export async function deleteRegulation(id: number) {
  return request(`${API_BASE}/admin/regulations/${id}`, { method: 'DELETE' });
}
