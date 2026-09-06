// 系统基础服务 —— 用户管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SysUser = {
  id?: number;
  username: string;
  realName?: string;
  phone?: string;
  phoneMask?: string;
  email?: string;
  avatar?: string;
  gender?: 0 | 1 | 2;
  status?: 0 | 1;
  deptId?: number;
  deptName?: string;
  companyId?: number;
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateTime?: string;
  roleIds?: number[];
  roleNames?: string[];
};

export type SysUserQuery = {
  current?: number;
  pageSize?: number;
  username?: string;
  status?: number;
  deptId?: number;
  [k: string]: unknown;
};

export async function listUsers(params: SysUserQuery) {
  return request(`${API_BASE}/system/users`, { method: 'GET', params });
}

export async function getUser(id: number) {
  return request<SysUser>(`${API_BASE}/system/users/${id}`, { method: 'GET' });
}

export async function addUser(body: Partial<SysUser>) {
  return request<SysUser>(`${API_BASE}/system/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateUser(id: number, body: Partial<SysUser>) {
  return request<SysUser>(`${API_BASE}/system/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteUser(id: number) {
  return request(`${API_BASE}/system/users/${id}`, { method: 'DELETE' });
}

export async function resetPassword(id: number, newPassword: string) {
  return request(`${API_BASE}/system/users/${id}/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: { newPassword },
  });
}
