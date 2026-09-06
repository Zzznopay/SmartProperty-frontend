// 房产 - 业主
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Owner = {
  id?: number;
  ownerCode: string;
  ownerName: string;
  gender?: 0 | 1 | 2;
  idCard?: string;
  idCardMask?: string;
  phone?: string;
  phoneMask?: string;
  email?: string;
  wechat?: string;
  address?: string;
  ownerType?: 1 | 2;
  emergencyContact?: string;
  emergencyPhone?: string;
  status?: 0 | 1;
  remark?: string;
  createTime?: string;
  rooms?: { roomId: number; roomNo: string; relationType: number }[];
  familyMembers?: {
    id: number;
    memberName: string;
    relation: string;
    gender: number;
    phoneMask: string;
  }[];
};

export async function listOwners(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/owners`, { method: 'GET', params });
}
export async function getOwner(id: number) {
  return request<Owner>(`${API_BASE}/property/owners/${id}`, { method: 'GET' });
}
export async function getOwnerRooms(id: number) {
  return request(`${API_BASE}/property/owners/${id}/rooms`, { method: 'GET' });
}
export async function addOwner(body: Partial<Owner>) {
  return request<Owner>(`${API_BASE}/property/owners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateOwner(id: number, body: Partial<Owner>) {
  return request<Owner>(`${API_BASE}/property/owners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteOwner(id: number) {
  return request(`${API_BASE}/property/owners/${id}`, { method: 'DELETE' });
}
export async function importOwners(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return request(`${API_BASE}/property/owners/import`, {
    method: 'POST',
    data: fd,
  });
}
