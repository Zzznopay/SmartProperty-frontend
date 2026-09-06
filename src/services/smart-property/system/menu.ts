// 系统基础服务 —— 菜单管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SysMenu = {
  id?: number;
  parentId?: number;
  menuName: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  menuType: 'M' | 'C' | 'F';
  sort?: number;
  visible?: boolean;
  status?: 0 | 1;
  children?: SysMenu[];
};

export async function getMenuTree() {
  return request<SysMenu[]>(`${API_BASE}/system/menus/tree`, { method: 'GET' });
}

export async function addMenu(body: Partial<SysMenu>) {
  return request<SysMenu>(`${API_BASE}/system/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateMenu(id: number, body: Partial<SysMenu>) {
  return request<SysMenu>(`${API_BASE}/system/menus/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteMenu(id: number) {
  return request(`${API_BASE}/system/menus/${id}`, { method: 'DELETE' });
}
