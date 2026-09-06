// 运营 - 保安安排
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SecurityArrange = {
  id?: number;
  communityId: number;
  arrangeDate: string;
  shiftType: number; // 1早班 2中班 3晚班
  startTime?: string;
  endTime?: string;
  position?: string;
  securityId?: number;
  securityName?: string;
  status?: number; // 1待执行 2执行中 3已完成
  remark?: string;
  createTime?: string;
};

export async function listSecurityArranges(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/security-arranges`, { method: 'GET', params });
}
export async function addSecurityArrange(body: Partial<SecurityArrange>) {
  return request(`${API_BASE}/operation/security-arranges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function completeSecurityArrange(id: number) {
  return request(`${API_BASE}/operation/security-arranges/${id}/complete`, {
    method: 'POST',
  });
}
export async function deleteSecurityArrange(id: number) {
  return request(`${API_BASE}/operation/security-arranges/${id}`, { method: 'DELETE' });
}
