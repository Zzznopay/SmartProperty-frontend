// 系统基础 - 登录日志
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type LoginLog = {
  id?: number;
  username?: string;
  ip?: string;
  location?: string;
  browser?: string;
  os?: string;
  status?: 0 | 1;
  msg?: string;
  loginTime?: string;
};

export async function listLoginLogs(params?: Record<string, unknown>) {
  return request(`${API_BASE}/system/login-logs`, { method: 'GET', params });
}

export async function cleanLoginLogs() {
  return request(`${API_BASE}/system/login-logs/clean`, { method: 'DELETE' });
}

export async function deleteLoginLog(id: number) {
  return request(`${API_BASE}/system/login-logs/${id}`, { method: 'DELETE' });
}
