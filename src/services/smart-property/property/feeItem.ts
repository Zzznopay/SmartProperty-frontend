// 房产 - 费项
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type FeeItem = {
  id?: number;
  communityId?: number;
  communityName?: string;
  feeName: string;
  feeCode: string;
  feeType?: 1 | 2 | 3 | 4;
  chargeMode?: 1 | 2 | 3;
  unitPrice?: number;
  unit?: string;
  billingCycle?: 1 | 2 | 3 | 4;
  isLadder?: 0 | 1;
  isActive?: 0 | 1;
  remark?: string;
  createTime?: string;
};

export async function listFeeItems(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/fee-items`, { method: 'GET', params });
}
export async function addFeeItem(body: Partial<FeeItem>) {
  return request<FeeItem>(`${API_BASE}/finance/fee-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateFeeItem(id: number, body: Partial<FeeItem>) {
  return request<FeeItem>(`${API_BASE}/finance/fee-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteFeeItem(id: number) {
  return request(`${API_BASE}/finance/fee-items/${id}`, { method: 'DELETE' });
}
