// 房产 - 票据管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Invoice = {
  id?: number;
  invoiceNo: string;
  invoiceType?: 1 | 2;
  userId?: number;
  userName?: string;
  status?: 1 | 2 | 3;
  useTime?: string;
  voidTime?: string;
  voidReason?: string;
  createTime?: string;
};

export async function listInvoices(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/invoices`, { method: 'GET', params });
}
export async function importInvoices(body: Invoice[]) {
  return request(`${API_BASE}/finance/invoices/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function assignInvoices(params: { invoiceIds: number[]; userId: number; userName: string }) {
  return request(`${API_BASE}/finance/invoices/assign`, {
    method: 'POST',
    params,
  });
}
export async function voidApplyInvoice(id: number, reason: string) {
  return request(`${API_BASE}/finance/invoices/${id}/void-apply`, {
    method: 'POST',
    params: { reason },
  });
}
export async function voidConfirmInvoice(id: number) {
  return request(`${API_BASE}/finance/invoices/${id}/void-confirm`, {
    method: 'POST',
  });
}
export async function deleteInvoice(id: number) {
  return request(`${API_BASE}/finance/invoices/${id}`, { method: 'DELETE' });
}
