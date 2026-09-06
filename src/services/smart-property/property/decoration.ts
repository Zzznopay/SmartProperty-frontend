// 房产 - 装修记录
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Decoration = {
  id?: number;
  roomId?: number;
  roomNo?: string;
  ownerId?: number;
  ownerName?: string;
  applyDate: string;
  startDate?: string;
  endDate?: string;
  decorationCompany?: string;
  contactName?: string;
  contactPhone?: string;
  deposit?: number;
  depositStatus?: 1 | 2 | 3;
  checkResult?: 1 | 2;
  status?: 1 | 2 | 3 | 4;
  remark?: string;
  createTime?: string;
};

export async function listDecorations(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/decoration-records`, { method: 'GET', params });
}
export async function addDecoration(body: Partial<Decoration>) {
  return request<Decoration>(`${API_BASE}/property/decoration-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function startDecoration(id: number, body: { startDate?: string }) {
  return request(`${API_BASE}/property/decoration-records/${id}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function completeDecoration(id: number, body: { endDate?: string }) {
  return request(`${API_BASE}/property/decoration-records/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function checkDecoration(id: number, body: { checkResult: 1 | 2; remark?: string }) {
  return request(`${API_BASE}/property/decoration-records/${id}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
