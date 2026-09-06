// 房产 - 小区
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Community = {
  id?: number;
  communityName: string;
  communityCode: string;
  address?: string;
  area?: number;
  buildingCount?: number;
  roomCount?: number;
  propertyFee?: number;
  contactName?: string;
  contactPhone?: string;
  status?: 0 | 1;
  remark?: string;
  createTime?: string;
};

export async function listCommunitys(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/communitys`, { method: 'GET', params });
}
export async function getCommunity(id: number) {
  return request<Community>(`${API_BASE}/property/communitys/${id}`, { method: 'GET' });
}
export async function addCommunity(body: Partial<Community>) {
  return request<Community>(`${API_BASE}/property/communitys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCommunity(id: number, body: Partial<Community>) {
  return request<Community>(`${API_BASE}/property/communitys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteCommunity(id: number) {
  return request(`${API_BASE}/property/communitys/${id}`, { method: 'DELETE' });
}
