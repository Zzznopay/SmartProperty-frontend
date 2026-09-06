// 系统基础 - 操作日志
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type OperLog = {
  id?: number;
  module?: string;
  businessType?: 0 | 1 | 2 | 3 | 4 | 5;
  method?: string;
  requestMethod?: string;
  operName?: string;
  operUrl?: string;
  operIp?: string;
  status?: 0 | 1;
  errorMsg?: string;
  costTime?: number;
  operTime?: string;
};

export async function listOperLogs(params?: Record<string, unknown>) {
  return request(`${API_BASE}/system/oper-logs`, { method: 'GET', params });
}

export async function cleanOperLogs() {
  return request(`${API_BASE}/system/oper-logs/clean`, { method: 'DELETE' });
}

export async function deleteOperLog(id: number) {
  return request(`${API_BASE}/system/oper-logs/${id}`, { method: 'DELETE' });
}
