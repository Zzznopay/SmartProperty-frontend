// 运营 - 消息中心
import { request } from '@umijs/max';
import { API_BASE } from '../apiBase';

export type Message = {
  id?: number;
  messageType: number; // 1站内消息 2短信 3邮件 4微信推送
  title: string;
  content: string;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  isRead?: number; // 0否 1是
  readTime?: string;
  sendStatus?: number; // 0待发送 1已发送 2发送失败
  sendTime?: string;
  failReason?: string;
  businessType?: string;
  businessId?: number;
  createTime?: string;
};

export async function listMessages(params?: Record<string, unknown>) {
  return request(`${API_BASE}/admin/messages`, { method: 'GET', params });
}
export async function addMessage(body: Partial<Message>) {
  return request(`${API_BASE}/admin/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}
export async function readMessage(id: number) {
  return request(`${API_BASE}/admin/messages/${id}/read`, { method: 'POST' });
}
export async function readAllMessages() {
  return request(`${API_BASE}/admin/messages/read-all`, { method: 'POST' });
}
export async function getUnreadCount() {
  return request(`${API_BASE}/admin/messages/unread-count`, {
    method: 'GET',
  });
}
