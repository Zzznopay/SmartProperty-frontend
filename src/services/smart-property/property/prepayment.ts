// 房产 - 预收款
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Prepayment = {
  id?: number;
  ownerId?: number;
  ownerName?: string;
  amount: number;
  usedAmount?: number;
  balance?: number;
  payTime: string;
  payType: 1 | 2 | 3 | 4;
  paymentNo?: string;
  status?: 1 | 2;
  remark?: string;
  createTime?: string;
};

export async function listPrepayments(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/prepayments`, { method: 'GET', params });
}
export async function addPrepayment(body: Partial<Prepayment>) {
  return request<Prepayment>(`${API_BASE}/finance/prepayments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function prepaymentBalance(ownerId: number) {
  return request(`${API_BASE}/finance/prepayments/balance/${ownerId}`, { method: 'GET' });
}
export async function prepaymentUsages(id: number) {
  return request(`${API_BASE}/finance/prepayments/${id}/usages`, { method: 'GET' });
}
