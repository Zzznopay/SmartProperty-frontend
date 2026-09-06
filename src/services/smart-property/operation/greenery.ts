// 运营 - 绿化植被
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Greenery = {
  id?: number;
  communityId?: number;
  greeneryName: string;
  greeneryType: number; // 1乔木 2灌木 3草坪 4花卉
  location?: string;
  quantity?: number;
  plantDate?: string;
  status?: number; // 1正常 2枯萎 3已移除
  remark?: string;
  createTime?: string;
};

export async function listGreeneries(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/greeneries`, { method: 'GET', params });
}
export async function addGreenery(body: Partial<Greenery>) {
  return request(`${API_BASE}/operation/greeneries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateGreenery(id: number, body: Partial<Greenery>) {
  return request<Greenery>(`${API_BASE}/operation/greeneries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteGreenery(id: number) {
  return request(`${API_BASE}/operation/greeneries/${id}`, { method: 'DELETE' });
}
