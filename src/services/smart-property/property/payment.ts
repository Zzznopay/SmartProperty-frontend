// 房产 - 收费 + 退款 + 作废
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Payment = {
  id?: number;
  paymentNo?: string;
  roomId?: number;
  roomNo?: string;
  ownerId?: number;
  ownerName?: string;
  totalAmount: number;
  actualAmount: number;
  discountAmount?: number;
  payType: 1 | 2 | 3 | 4 | 5;
  payTime: string;
  receiptNo?: string;
  invoiceNo?: string;
  cashierName?: string;
  status?: 1 | 2 | 3;
  auditStatus?: 0 | 1;
  remark?: string;
  createTime?: string;
};

export type CollectPaymentPayload = {
  ownerId: number;
  roomId: number;
  payType: Payment['payType'];
  ledgerIds: number[];
  discountAmount?: number;
  remark?: string;
};

export async function listPayments(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/payments`, { method: 'GET', params });
}
export async function collectPayment(body: CollectPaymentPayload) {
  return request<Payment>(`${API_BASE}/finance/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function refundPayment(id: number, body: { reason: string }) {
  return request(`${API_BASE}/finance/payments/${id}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function voidPayment(id: number, body: { reason: string }) {
  return request(`${API_BASE}/finance/payments/${id}/void`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
