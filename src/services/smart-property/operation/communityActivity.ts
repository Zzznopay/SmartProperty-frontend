// 运营 - 社区活动
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type CommunityActivity = {
  id?: number;
  communityId?: number;
  activityName: string;
  activityType: number; // 1公益 2文体 3节日 4其他
  activityDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  content?: string;
  participantCount?: number;
  budget?: number;
  actualCost?: number;
  organizer?: string;
  status?: number; // 1计划中 2进行中 3已完成
  remark?: string;
  createTime?: string;
};

export async function listCommunityActivitys(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/community-activities`, { method: 'GET', params });
}
export async function addCommunityActivity(body: Partial<CommunityActivity>) {
  return request(`${API_BASE}/operation/community-activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateCommunityActivity(id: number, body: Partial<CommunityActivity>) {
  return request<CommunityActivity>(`${API_BASE}/operation/community-activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function completeCommunityActivity(id: number) {
  return request(`${API_BASE}/operation/community-activities/${id}/complete`, {
    method: 'POST',
  });
}
export async function deleteCommunityActivity(id: number) {
  return request(`${API_BASE}/operation/community-activities/${id}`, { method: 'DELETE' });
}
