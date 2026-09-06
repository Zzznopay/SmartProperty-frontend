// 运营 - 消防巡查
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type FirePatrol = {
  id?: number;
  communityId?: number;
  patrolDate?: string;
  patrolTime?: string;
  patrolArea: string;
  patrolResult?: number; // 1正常 2异常
  problems?: string;
  patrolUserId?: number;
  patrolUserName?: string;
  handleContent?: string;
  status?: number; // 1待处理 2已处理
  remark?: string;
  createTime?: string;
};

export async function listFirePatrols(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/fire-patrols`, { method: 'GET', params });
}
export async function getFirePatrol(id: number) {
  return request<FirePatrol>(`${API_BASE}/operation/fire-patrols/${id}`, {
    method: 'GET',
  });
}
export async function addFirePatrol(body: Partial<FirePatrol>) {
  return request(`${API_BASE}/operation/fire-patrols`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateFirePatrol(id: number, body: Partial<FirePatrol>) {
  return request<FirePatrol>(`${API_BASE}/operation/fire-patrols/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteFirePatrol(id: number) {
  return request(`${API_BASE}/operation/fire-patrols/${id}`, { method: 'DELETE' });
}
