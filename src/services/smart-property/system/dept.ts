// 系统基础服务 —— 部门管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SysDept = {
  id?: number;
  parentId?: number;
  deptName: string;
  sort?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: 0 | 1;
  children?: SysDept[];
};

export async function getDeptTree() {
  return request<SysDept[]>(`${API_BASE}/system/depts/tree`, { method: 'GET' });
}

export async function addDept(body: Partial<SysDept>) {
  return request<SysDept>(`${API_BASE}/system/depts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateDept(id: number, body: Partial<SysDept>) {
  return request<SysDept>(`${API_BASE}/system/depts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteDept(id: number) {
  return request(`${API_BASE}/system/depts/${id}`, { method: 'DELETE' });
}
