// 房产 - 抄表
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type MeterReading = {
  id?: number;
  roomId?: number;
  roomNo?: string;
  meterType: 1 | 2 | 3;
  meterNo?: string;
  readingMonth: string;
  lastReading: number;
  currentReading: number;
  usageAmount?: number;
  readingUser?: string;
  readingDate?: string;
  createTime?: string;
};

export async function listMeterReadings(params?: Record<string, unknown>) {
  return request(`${API_BASE}/finance/meter-readings`, { method: 'GET', params });
}
export async function addMeterReading(body: Partial<MeterReading>) {
  return request<MeterReading>(`${API_BASE}/finance/meter-readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function batchAddMeterReadings(body: Partial<MeterReading>[]) {
  return request(`${API_BASE}/finance/meter-readings/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
