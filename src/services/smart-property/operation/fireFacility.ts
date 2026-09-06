// 运营 - 消防设施
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type FireFacility = {
  id?: number;
  communityId?: number;
  buildingId?: number;
  facilityName: string;
  facilityType: number; // 1灭火器 2消防栓 3喷淋 4烟感 5应急灯
  facilityNo?: string;
  location?: string;
  installDate?: string;
  expireDate?: string;
  status?: number; // 1正常 2故障 3维修中 4已过期
  lastCheckDate?: string;
  nextCheckDate?: string;
  remark?: string;
  createTime?: string;
};

export async function listFireFacilitys(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/fire-facilities`, { method: 'GET', params });
}
export async function addFireFacility(body: Partial<FireFacility>) {
  return request(`${API_BASE}/operation/fire-facilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function checkFireFacility(id: number) {
  return request(`${API_BASE}/operation/fire-facilities/${id}/check`, {
    method: 'POST',
  });
}
export async function deleteFireFacility(id: number) {
  return request(`${API_BASE}/operation/fire-facilities/${id}`, { method: 'DELETE' });
}
