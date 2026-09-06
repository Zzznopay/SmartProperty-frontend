// 系统基础服务 —— 角色管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SysRole = {
  id?: number;
  roleName: string;
  roleKey: string;
  sort?: number;
  status?: 0 | 1;
  remark?: string;
  createTime?: string;
  menuIds?: number[];
};

export async function listRoles(params?: { current?: number; pageSize?: number; roleName?: string }) {
  return request(`${API_BASE}/system/roles`, { method: 'GET', params });
}

export async function addRole(body: Partial<SysRole>) {
  return request<SysRole>(`${API_BASE}/system/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateRole(id: number, body: Partial<SysRole>) {
  return request<SysRole>(`${API_BASE}/system/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteRole(id: number) {
  return request(`${API_BASE}/system/roles/${id}`, { method: 'DELETE' });
}

export async function assignRoleMenus(roleId: number, menuIds: number[]) {
  return request(`${API_BASE}/system/roles/${roleId}/menus`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: { menuIds },
  });
}
