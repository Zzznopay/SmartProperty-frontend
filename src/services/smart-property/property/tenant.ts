// 房产 - 租户
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Tenant = {
  id?: number;
  tenantCode: string;
  tenantName: string;
  gender?: 0 | 1 | 2;
  idCard?: string;
  idCardMask?: string;
  phone?: string;
  phoneMask?: string;
  email?: string;
  companyName?: string;
  status?: 0 | 1;
  remark?: string;
  createTime?: string;
};

export async function listTenants(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/tenants`, { method: 'GET', params });
}
export async function getTenant(id: number) {
  return request<Tenant>(`${API_BASE}/property/tenants/${id}`, { method: 'GET' });
}
export async function addTenant(body: Partial<Tenant>) {
  return request<Tenant>(`${API_BASE}/property/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateTenant(id: number, body: Partial<Tenant>) {
  return request<Tenant>(`${API_BASE}/property/tenants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteTenant(id: number) {
  return request(`${API_BASE}/property/tenants/${id}`, { method: 'DELETE' });
}
