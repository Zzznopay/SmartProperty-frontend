// 房产 - 销售合同
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SaleContract = {
  id?: number;
  contractNo: string;
  roomId?: number;
  roomNo?: string;
  ownerId?: number;
  ownerName?: string;
  contractDate: string;
  salePrice: number;
  payType?: 1 | 2 | 3;
  downPayment?: number;
  loanAmount?: number;
  deliveryDate?: string;
  deliveryStatus?: 0 | 1;
  status?: 1 | 2 | 3;
  remark?: string;
  createTime?: string;
};

export async function listSaleContracts(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/sale-contracts`, { method: 'GET', params });
}
export async function getSaleContract(id: number) {
  return request<SaleContract>(`${API_BASE}/property/sale-contracts/${id}`, { method: 'GET' });
}
export async function addSaleContract(body: Partial<SaleContract>) {
  return request<SaleContract>(`${API_BASE}/property/sale-contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deliverSaleContract(id: number) {
  return request(`${API_BASE}/property/sale-contracts/${id}/deliver`, {
    method: 'POST',
  });
}
export async function deleteSaleContract(id: number) {
  return request(`${API_BASE}/property/sale-contracts/${id}`, { method: 'DELETE' });
}
