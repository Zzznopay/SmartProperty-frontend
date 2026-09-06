// 房产 - 房间
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Room = {
  id?: number;
  communityId?: number;
  communityName?: string;
  buildingId?: number;
  buildingName?: string;
  unitId?: number;
  unitName?: string;
  roomCode: string;
  roomNo: string;
  floor?: number;
  roomType?: 1 | 2 | 3 | 4 | 5;
  buildArea?: number;
  innerArea?: number;
  publicArea?: number;
  orientation?: string;
  decoration?: 1 | 2 | 3;
  status?: 1 | 2 | 3 | 4;
  ownerId?: number;
  ownerName?: string;
  tenantId?: number;
  tenantName?: string;
  checkInTime?: string;
  remark?: string;
  createTime?: string;
};

export type RoomTreeNode = {
  id: number;
  parentId?: number;
  name: string;
  type: 'community' | 'building' | 'unit' | 'room';
  status?: number;
  children?: RoomTreeNode[];
};

export async function listRooms(params?: Record<string, unknown>) {
  return request(`${API_BASE}/property/rooms`, { method: 'GET', params });
}
export async function getRoomTree(params?: Record<string, unknown>) {
  return request<RoomTreeNode[]>(`${API_BASE}/property/rooms/tree`, {
    method: 'GET',
    params,
  });
}
export async function addRoom(body: Partial<Room>) {
  return request<Room>(`${API_BASE}/property/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function batchAddRooms(body: Partial<Room>[]) {
  return request(`${API_BASE}/property/rooms/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function updateRoom(id: number, body: Partial<Room>) {
  return request<Room>(`${API_BASE}/property/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function deleteRoom(id: number) {
  return request(`${API_BASE}/property/rooms/${id}`, { method: 'DELETE' });
}
