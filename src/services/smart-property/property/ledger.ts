// 房产 - 物业费台帐 + 欠费
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Ledger = {
  id?: number;
  communityId?: number;
  communityName?: string;
  roomId?: number;
  roomNo?: string;
  ownerId?: number;
  ownerName?: string;
  feeItemId?: number;
  feeItemName?: string;
  ledgerMonth: string;
  amount: number;
  paidAmount?: number;
  discountAmount?: number;
  lateFee?: number;
  status?: 1 | 2 | 3;
  dueDate?: string;
  payTime?: string;
  remark?: string;
  createTime?: string;
};

export async function listLedgers(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/ledgers`, { method: 'GET', params });
}
export async function arrearsLedgers(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/ledgers/arrears`, { method: 'GET', params });
}
export async function generateLedger(body: {
  communityId: number;
  ledgerMonth: string;
  feeItemIds?: number[];
}) {
  return request(`${API_BASE}/finance/ledgers/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function batchGenerateLedger(body: {
  communityIds: number[];
  ledgerMonth: string;
}) {
  return request(`${API_BASE}/finance/ledgers/batch-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
