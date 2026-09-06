// 运营 - 投票调查
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Survey = {
  id?: number;
  communityId?: number;
  surveyTitle: string;
  surveyDesc?: string;
  surveyType: number; // 1投票 2问卷
  startTime?: string;
  endTime?: string;
  isAnonymous?: number; // 0否 1是
  isMultiple?: number; // 0否 1是
  maxSelect?: number;
  participantCount?: number;
  status?: number; // 1草稿 2进行中 3已结束
  remark?: string;
  createTime?: string;
};

export type SurveyOption = {
  id?: number;
  surveyId?: number;
  optionContent?: string;
  optionOrder?: number;
  voteCount?: number;
  createTime?: string;
};

export type SurveyStatisticsVO = {
  surveyId?: number;
  surveyTitle?: string;
  participantCount?: number;
  optionId?: number;
  optionContent?: string;
  voteCount?: number;
  percentage?: number;
};

export async function listSurveys(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/surveys`, { method: 'GET', params });
}
export async function getSurvey(id: number) {
  return request<Survey>(`${API_BASE}/admin/surveys/${id}`, { method: 'GET' });
}
export async function getSurveyOptions(id: number) {
  return request(`${API_BASE}/admin/surveys/${id}/options`, {
    method: 'GET',
  });
}
export async function addSurvey(body: Partial<Survey>) {
  return request(`${API_BASE}/admin/surveys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function voteSurvey(id: number, optionId: number) {
  return request(`${API_BASE}/admin/surveys/${id}/vote`, {
    method: 'POST',
    params: { optionId },
  });
}
export async function deleteSurvey(id: number) {
  return request(`${API_BASE}/admin/surveys/${id}`, { method: 'DELETE' });
}
export async function getSurveyStatistics(id: number) {
  return request(`${API_BASE}/admin/surveys/${id}/statistics`, {
    method: 'GET',
  });
}
export async function finishSurvey(id: number) {
  return request(`${API_BASE}/admin/surveys/${id}/finish`, {
    method: 'POST',
  });
}
