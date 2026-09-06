// 运营 - 业委会成员
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CommitteeMember = {
  id?: number;
  communityId?: number;
  memberName: string;
  position?: string;
  phone?: string;
  roomId?: number;
  termStart?: string; // yyyy-MM-dd
  termEnd?: string; // yyyy-MM-dd
  photo?: string;
  introduction?: string;
  status?: number; // 1在任 2已离任
  remark?: string;
  createTime?: string;
};

export async function listCommitteeMembers(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/committee-members`, { method: 'GET', params });
}
export async function getCommitteeMember(id: number) {
  return request<CommitteeMember>(`${API_BASE}/admin/committee-members/${id}`, {
    method: 'GET',
  });
}
export async function addCommitteeMember(body: Partial<CommitteeMember>) {
  return request<CommitteeMember>(`${API_BASE}/admin/committee-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCommitteeMember(id: number, body: Partial<CommitteeMember>) {
  return request<CommitteeMember>(`${API_BASE}/admin/committee-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteCommitteeMember(id: number) {
  return request(`${API_BASE}/admin/committee-members/${id}`, { method: 'DELETE' });
}
