// 系统基础服务 —— 字典管理
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type SysDictType = {
  id?: number;
  dictName: string;
  dictType: string;
  status?: 0 | 1;
  remark?: string;
};

export type SysDictData = {
  id?: number;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  sort?: number;
  status?: 0 | 1;
  remark?: string;
};

export async function listDictTypes(params?: { current?: number; pageSize?: number; dictName?: string; dictType?: string }) {
  return request(`${API_BASE}/system/dict/types`, { method: 'GET', params });
}

export async function addDictType(body: Partial<SysDictType>) {
  return request<SysDictType>(`${API_BASE}/system/dict/types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateDictType(id: number, body: Partial<SysDictType>) {
  return request<SysDictType>(`${API_BASE}/system/dict/types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteDictType(id: number) {
  return request(`${API_BASE}/system/dict/types/${id}`, { method: 'DELETE' });
}

export async function listDictData(dictType: string) {
  return request<SysDictData[]>(`${API_BASE}/system/dict/data/${dictType}`, {
    method: 'GET',
  });
}

export async function addDictData(body: Partial<SysDictData>) {
  return request<SysDictData>(`${API_BASE}/system/dict/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function updateDictData(id: number, body: Partial<SysDictData>) {
  return request<SysDictData>(`${API_BASE}/system/dict/data/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export async function deleteDictData(id: number) {
  return request(`${API_BASE}/system/dict/data/${id}`, { method: 'DELETE' });
}
