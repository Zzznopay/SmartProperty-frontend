// 运营 - 服务工单
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type ServiceOrder = {
  id?: number;
  communityId?: number;
  orderNo?: string;
  orderType: number; // 1报修 2投诉 3建议 4咨询
  title: string;
  content: string;
  roomId?: number;
  ownerId?: number;
  ownerName?: string;
  ownerPhone?: string;
  images?: string;
  priority?: number; // 1紧急 2普通 3低
  status?: number; // 1待分配 2处理中 3待回访 4已完成 5已关闭
  assignUserId?: number;
  assignUserName?: string;
  assignTime?: string;
  handleContent?: string;
  handleTime?: string;
  visitContent?: string;
  visitScore?: number;
  visitTime?: string;
  closeTime?: string;
  remark?: string;
  createTime?: string;
};

export async function listServiceOrders(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/service-orders`, { method: 'GET', params });
}
export async function getServiceOrder(id: number) {
  return request<ServiceOrder>(`${API_BASE}/operation/service-orders/${id}`, {
    method: 'GET',
  });
}
export async function addServiceOrder(body: Partial<ServiceOrder>) {
  return request(`${API_BASE}/operation/service-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function assignServiceOrder(
  id: number,
  assignUserId: number,
  assignUserName: string,
) {
  return request(`${API_BASE}/operation/service-orders/${id}/assign`, {
    method: 'POST',
    params: { assignUserId, assignUserName },
  });
}
export async function handleServiceOrder(id: number, handleContent: string) {
  return request(`${API_BASE}/operation/service-orders/${id}/handle`, {
    method: 'POST',
    params: { handleContent },
  });
}
export async function visitServiceOrder(
  id: number,
  visitContent: string,
  visitScore: number,
) {
  return request(`${API_BASE}/operation/service-orders/${id}/visit`, {
    method: 'POST',
    params: { visitContent, visitScore },
  });
}
export async function closeServiceOrder(id: number) {
  return request(`${API_BASE}/operation/service-orders/${id}/close`, {
    method: 'POST',
  });
}
