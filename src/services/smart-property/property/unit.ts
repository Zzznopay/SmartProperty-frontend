// 房产 - 单元
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Unit = {
  id?: number;
  buildingId?: number;
  buildingName?: string;
  unitName: string;
  unitCode: string;
  floorCount?: number;
  roomCount?: number;
  sort?: number;
  status?: 0 | 1;
  createTime?: string;
};

export async function listUnits(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/units`, { method: 'GET', params });
}
export async function addUnit(body: Partial<Unit>) {
  return request<Unit>(`${API_BASE}/property/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateUnit(id: number, body: Partial<Unit>) {
  return request<Unit>(`${API_BASE}/property/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteUnit(id: number) {
  return request(`${API_BASE}/property/units/${id}`, { method: 'DELETE' });
}
