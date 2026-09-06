// 首页数据看板 - 统计接口封装
import { request } from '@umijs/max';
import { API_BASE } from '../../services/smart-property/apiBase';

/** 房产财务概览 */
export type PropertyOverview = {
  communityCount: number;
  buildingCount: number;
  roomCount: number;
  ownerCount: number;
  parkingSpaceCount: number;
  activeLeaseCount: number;
  monthPaymentAmount: number;
  pendingLedgerCount: number;
};

/** 运营管理概览 */
export type OperationOverview = {
  serviceOrderCount: number;
  pendingServiceOrderCount: number;
  todayVisitCount: number;
  todayVehicleCount: number;
  noticeCount: number;
  communityActivityCount: number;
  cleanCheckCount: number;
  firePatrolCount: number;
  greeneryCheckCount: number;
};

export type MonthAmount = { month: string; amount: number };
export type MonthCount = { month: string; count: number };
export type StatusCount = { status: number; count: number };

// 后端响应已被 requestErrorConfig 解包为 { data, success }
export async function getPropertyOverview(): Promise<{
  data: PropertyOverview;
}> {
  return request(`${API_BASE}/property/statistics/overview`);
}

export async function getOperationOverview(): Promise<{
  data: OperationOverview;
}> {
  return request(`${API_BASE}/operation/statistics/overview`);
}

export async function getPaymentTrend(
  months = 6,
): Promise<{ data: MonthAmount[] }> {
  return request(`${API_BASE}/property/statistics/payment-trend`, {
    method: 'GET',
    params: { months },
  });
}

export async function getFeeStatus(): Promise<{ data: StatusCount[] }> {
  return request(`${API_BASE}/property/statistics/fee-status`);
}

export async function getServiceOrderStatus(): Promise<{
  data: StatusCount[];
}> {
  return request(`${API_BASE}/operation/statistics/service-order-status`);
}

export async function getServiceOrderTrend(
  months = 6,
): Promise<{ data: MonthCount[] }> {
  return request(`${API_BASE}/operation/statistics/service-order-trend`, {
    method: 'GET',
    params: { months },
  });
}
