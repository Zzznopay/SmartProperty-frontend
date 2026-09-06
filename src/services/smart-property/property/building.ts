// 房产 - 楼宇
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Building = {
  id?: number;
  communityId?: number;
  communityName?: string;
  buildingName: string;
  buildingCode: string;
  buildingType?: 1 | 2 | 3 | 4 | 5;
  floorCount?: number;
  roomCount?: number;
  area?: number;
  buildYear?: number;
  status?: 0 | 1;
  remark?: string;
  createTime?: string;
};

export async function listBuildings(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/buildings`, { method: 'GET', params });
}
export async function addBuilding(body: Partial<Building>) {
  return request<Building>(`${API_BASE}/property/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateBuilding(id: number, body: Partial<Building>) {
  return request<Building>(`${API_BASE}/property/buildings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteBuilding(id: number) {
  return request(`${API_BASE}/property/buildings/${id}`, { method: 'DELETE' });
}
export async function batchAddBuildings(body: Partial<Building>[]) {
  return request(`${API_BASE}/property/buildings/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
