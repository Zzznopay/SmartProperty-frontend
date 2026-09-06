// 运营 - 公告
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Notice = {
  id?: number;
  communityId?: number;
  noticeTitle: string;
  noticeContent: string;
  noticeType?: number; // 1通知 2公告 3温馨提示 4紧急通知
  isTop?: number; // 0否 1是
  isPublish?: number; // 0否 1是
  publishTime?: string;
  expireTime?: string;
  readCount?: number;
  images?: string;
  attachments?: string;
  status?: number; // 1草稿 2已发布 3已撤回
  remark?: string;
  createTime?: string;
};

export async function listNotices(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/notices`, { method: 'GET', params });
}
export async function getNotice(id: number) {
  return request<Notice>(`${API_BASE}/admin/notices/${id}`, {
    method: 'GET',
  });
}
export async function addNotice(body: Partial<Notice>) {
  return request<Notice>(`${API_BASE}/admin/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateNotice(id: number, body: Partial<Notice>) {
  return request<Notice>(`${API_BASE}/admin/notices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function publishNotice(id: number) {
  return request(`${API_BASE}/admin/notices/${id}/publish`, { method: 'POST' });
}
export async function revokeNotice(id: number) {
  return request(`${API_BASE}/admin/notices/${id}/revoke`, { method: 'POST' });
}
export async function deleteNotice(id: number) {
  return request(`${API_BASE}/admin/notices/${id}`, { method: 'DELETE' });
}
