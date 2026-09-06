// 房产 - 车位管理 + 缴费
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Parking = {
  id?: number;
  communityId?: number;
  communityName?: string;
  parkingNo: string;
  parkingType?: 1 | 2 | 3;
  parkingArea?: number;
  ownerId?: number;
  ownerName?: string;
  tenantId?: number;
  tenantName?: string;
  status?: 1 | 2 | 3;
  salePrice?: number;
  saleDate?: string;
  rentPrice?: number;
  rentStartDate?: string;
  rentEndDate?: string;
  remark?: string;
  createTime?: string;
};

export async function listParkings(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/parking-spaces`, { method: 'GET', params });
}
export async function getParking(id: number) {
  return request<Parking>(`${API_BASE}/finance/parking-spaces/${id}`, { method: 'GET' });
}
export async function addParking(body: Partial<Parking>) {
  return request<Parking>(`${API_BASE}/finance/parking-spaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateParking(id: number, body: Partial<Parking>) {
  return request<Parking>(`${API_BASE}/finance/parking-spaces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteParking(id: number) {
  return request(`${API_BASE}/finance/parking-spaces/${id}`, { method: 'DELETE' });
}
export async function saleParking(id: number, body: { ownerId: number; salePrice: number; saleDate: string }) {
  return request(`${API_BASE}/finance/parking-spaces/${id}/sale`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function rentParking(
  id: number,
  body: { tenantId: number; rentPrice: number; startDate: string; endDate: string },
) {
  return request(`${API_BASE}/finance/parking-spaces/${id}/rent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function payParking(body: {
  parkingId: number;
  feeType: 1 | 2;
  feeMonth: string;
  amount: number;
  payType: 1 | 2 | 3 | 4;
  payTime: string;
}) {
  return request(`${API_BASE}/property/parking-payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
