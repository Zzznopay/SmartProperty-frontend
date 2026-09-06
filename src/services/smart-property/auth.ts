// smart-property-system 认证模块接口对接
import { request } from '@umijs/max';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/requestErrorConfig';
import { API_BASE } from './apiBase';

/** 当前用户信息（来自 /auth/user-info） */
export type CurrentUser = {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  deptId?: number;
  companyId?: number;
};

/** 登录参数 */
export type LoginParams = {
  username: string;
  password: string;
  captchaCode?: string;
  captchaKey?: string;
};

/** 登录返回 */
export type LoginResult = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo: CurrentUser;
};

/** 图形验证码返回 */
export type CaptchaResult = {
  captchaKey: string;
  img: string; // base64 图片
};

/** 菜单树节点 */
export type MenuNode = {
  id: number;
  parentId?: number;
  menuName: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  menuType: 'M' | 'C' | 'F';
  sort?: number;
  visible?: boolean;
  status?: number;
  children?: MenuNode[];
};

/** 用户信息 request —— 兼容 getInitialState */
export async function queryCurrentUser(options?: { skipErrorHandler?: boolean }) {
  return request<{ data: CurrentUser }>(`${API_BASE}/auth/user-info`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录 */
export async function login(body: LoginParams) {
  // 响应拦截器对非列表请求返回 { data: 业务数据, success }，这里解包取业务数据
  const resp = await request<{ data: LoginResult }>(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
  const result = resp.data;
  if (result?.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    if (result.refreshToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  }
  return result;
}

/** 注销 */
export async function logout() {
  try {
    await request(`${API_BASE}/auth/logout`, { method: 'POST' });
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/** 刷新 token */
export async function refreshToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw new Error('refresh_token 不存在');
  return request<{ accessToken: string; refreshToken: string; expiresIn: number }>(
    `${API_BASE}/auth/refresh`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { refreshToken: refresh },
    },
  );
}

/** 获取图形验证码 */
export async function getCaptcha() {
  // 响应拦截器对非列表请求返回 { data: 业务数据, success }，这里解包取业务数据
  const resp = await request<{ data: CaptchaResult }>(`${API_BASE}/auth/captcha`, { method: 'GET' });
  return resp.data;
}

/** 获取当前用户菜单树 */
export async function queryMenus() {
  return request<{ data: MenuNode[] }>(`${API_BASE}/auth/menus`, { method: 'GET' });
}

/** 修改当前用户密码 */
export async function changePassword(oldPassword: string, newPassword: string) {
  return request(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    params: { oldPassword, newPassword },
  });
}
