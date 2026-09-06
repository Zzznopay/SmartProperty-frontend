// 运营 - 意见箱
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type OpinionBox = {
  id?: number;
  communityId?: number;
  boxName: string;
  adminUserId?: number;
  adminUserName?: string;
  isAnonymous?: number; // 0否 1是
  isActive?: number; // 0否 1是
  remark?: string;
  createTime?: string;
};

export type OpinionSubmit = {
  id?: number;
  boxId?: number;
  title: string;
  content: string;
  isAnonymous?: number; // 0否 1是
  submitUserName?: string;
  submitTime?: string;
  status?: number; // 1待处理 2处理中 3已回复 4已关闭
  replyContent?: string;
  replyTime?: string;
  satisfaction?: number; // 1-5
  remark?: string;
  createTime?: string;
};

export async function listOpinionBoxes(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/opinion-boxes`, { method: 'GET', params });
}
export async function addOpinionBox(body: Partial<OpinionBox>) {
  return request(`${API_BASE}/admin/opinion-boxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function listOpinionSubmits(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/opinion-boxes/submits`, {
    method: 'GET',
    params,
  });
}
export async function replyOpinionSubmit(id: number, replyContent: string) {
  return request(`${API_BASE}/admin/opinion-boxes/submits/${id}/reply`, {
    method: 'POST',
    params: { replyContent },
  });
}
export async function closeOpinionSubmit(id: number) {
  return request(`${API_BASE}/admin/opinion-boxes/submits/${id}/close`, {
    method: 'POST',
  });
}
export async function deleteOpinionBox(id: number) {
  return request(`${API_BASE}/admin/opinion-boxes/${id}`, { method: 'DELETE' });
}
