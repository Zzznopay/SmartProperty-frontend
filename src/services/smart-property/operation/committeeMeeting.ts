// 运营 - 业委会会议
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CommitteeMeeting = {
  id?: number;
  communityId?: number;
  meetingTitle: string;
  meetingDate?: string; // yyyy-MM-dd
  startTime?: string; // HH:mm:ss
  endTime?: string; // HH:mm:ss
  location?: string;
  meetingContent?: string;
  meetingSummary?: string;
  attendees?: string;
  images?: string;
  status?: number; // 1计划中 2进行中 3已完成
  remark?: string;
  createTime?: string;
};

export async function listCommitteeMeetings(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/committee-meetings`, { method: 'GET', params });
}
export async function getCommitteeMeeting(id: number) {
  return request<CommitteeMeeting>(`${API_BASE}/admin/committee-meetings/${id}`, {
    method: 'GET',
  });
}
export async function addCommitteeMeeting(body: Partial<CommitteeMeeting>) {
  return request<CommitteeMeeting>(`${API_BASE}/admin/committee-meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCommitteeMeeting(id: number, body: Partial<CommitteeMeeting>) {
  return request<CommitteeMeeting>(`${API_BASE}/admin/committee-meetings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteCommitteeMeeting(id: number) {
  return request(`${API_BASE}/admin/committee-meetings/${id}`, { method: 'DELETE' });
}
