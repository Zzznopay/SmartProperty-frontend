// 系统基础 - 物业公司
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Company = {
  id?: number;
  parentId?: number;
  companyName: string;
  companyCode: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  logo?: string;
  status?: 0 | 1;
  remark?: string;
  children?: Company[];
};

export async function listCompanys(params?: Record<string, unknown>) {
  return request(`${API_BASE}/system/companys`, { method: 'GET', params });
}
export async function addCompany(body: Partial<Company>) {
  return request<Company>(`${API_BASE}/system/companys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCompany(id: number, body: Partial<Company>) {
  return request<Company>(`${API_BASE}/system/companys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteCompany(id: number) {
  return request(`${API_BASE}/system/companys/${id}`, { method: 'DELETE' });
}
