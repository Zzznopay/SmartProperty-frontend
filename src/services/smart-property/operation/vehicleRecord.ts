// 运营 - 车辆进出记录
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type VehicleRecord = {
  id?: number;
  communityId: number;
  plateNo: string;
  vehicleType: number; // 1小型车 2大型车 3摩托车
  recordType?: number; // 1入场 2出场
  recordTime?: string;
  gateName?: string;
  imageUrl?: string;
  parkingId?: number;
  isTemporary?: number; // 0否 1是
  feeAmount?: number;
  payStatus?: number; // 0未缴 1已缴
  payTime?: string;
  remark?: string;
  createTime?: string;
};

export async function listVehicleRecords(params?: Record<string, unknown>) {
  return request(`${API_BASE}/operation/vehicle-records`, { method: 'GET', params });
}
export async function vehicleEntry(body: Partial<VehicleRecord>) {
  return request(`${API_BASE}/operation/vehicle-records/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function vehicleExit(id: number) {
  return request(`${API_BASE}/operation/vehicle-records/${id}/exit`, {
    method: 'POST',
  });
}
export async function vehiclePay(id: number) {
  return request(`${API_BASE}/operation/vehicle-records/${id}/pay`, {
    method: 'POST',
  });
}
