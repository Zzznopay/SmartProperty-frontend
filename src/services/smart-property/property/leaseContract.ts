// 房产 - 租赁合同
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type LeaseContract = {
  id?: number;
  contractNo: string;
  roomId?: number;
  roomNo?: string;
  tenantId?: number;
  tenantName?: string;
  leaseType?: 1 | 2;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit?: number;
  payCycle?: 1 | 2 | 3 | 4;
  status?: 1 | 2 | 3 | 4;
  terminateDate?: string;
  terminateReason?: string;
  remark?: string;
  createTime?: string;
};

export async function listLeaseContracts(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/lease-contracts`, { method: 'GET', params });
}
export async function addLeaseContract(body: Partial<LeaseContract>) {
  return request<LeaseContract>(`${API_BASE}/property/lease-contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateLeaseContract(id: number, body: Partial<LeaseContract>) {
  return request<LeaseContract>(`${API_BASE}/property/lease-contracts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function terminateLease(id: number, body: { terminateDate: string; terminateReason?: string }) {
  return request(`${API_BASE}/property/lease-contracts/${id}/terminate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function expiringLeases(days = 30) {
  return request(`${API_BASE}/property/lease-contracts/expiring`, {
    method: 'GET',
    params: { days },
  });
}
