// 运营 - 物品出入记录
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type GoodsRecord = {
  id?: number;
  communityId: number;
  recordType: number; // 1物品带入 2物品带出
  goodsName: string;
  goodsDesc?: string;
  quantity?: number;
  ownerName?: string;
  roomId?: number;
  operatorName?: string;
  operatorPhone?: string;
  operateTime?: string;
  guardId?: number;
  guardName?: string;
  remark?: string;
  createTime?: string;
};

export async function listGoodsRecords(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/goods-records`, { method: 'GET', params });
}
export async function getGoodsRecord(id: number) {
  return request<GoodsRecord>(`${API_BASE}/operation/goods-records/${id}`, {
    method: 'GET',
  });
}
export async function addGoodsRecord(body: Partial<GoodsRecord>) {
  return request(`${API_BASE}/operation/goods-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteGoodsRecord(id: number) {
  return request(`${API_BASE}/operation/goods-records/${id}`, { method: 'DELETE' });
}
