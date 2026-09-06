import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getIntl, history } from '@umijs/max';
import { message } from 'antd';

// 业务成功码约定：与后端 smart-property-common-core 一致
const SUCCESS_CODE = '00000';

// Token 存储 key（与 auth.ts 配套）
const ACCESS_TOKEN_KEY = 'sp_access_token';
const REFRESH_TOKEN_KEY = 'sp_refresh_token';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// 后端统一响应格式 { code, message, data, ...? (分页) }
interface BizResponse<T = unknown> {
  code: string;
  message?: string;
  data?: T;
  // 分页响应（在 data 外的扁平字段）
  total?: number;
  pageNum?: number;
  pageSize?: number;
  pages?: number;
  records?: T[];
}

/**
 * 是否"分页类"请求：
 *  - GET + current/pageSize params  → 当作 ProTable request
 */
function isTableLikeRequest(config: RequestOptions | undefined): boolean {
  if (!config) return false;
  const method = (config.method || 'GET').toUpperCase();
  if (method !== 'GET') return false;
  const params = (config.params ?? {}) as {
    current?: number;
    pageSize?: number;
  };
  return params.current !== undefined || params.pageSize !== undefined;
}

/** 把 ProTable params 转成后端约定 */
function toBackendQuery(params: Record<string, unknown>) {
  const { current, pageSize, ...rest } = params as {
    current?: number;
    pageSize?: number;
    [k: string]: unknown;
  };
  return {
    pageNum: current ?? 1,
    pageSize: pageSize ?? 10,
    ...rest,
  };
}

export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: () => {},
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error?.name === 'BizError') {
        message.error(error?.info?.errorMessage || '业务错误');
        return;
      }
      if (error?.response) {
        const status = error.response.status;
        if (status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          const { pathname, search, hash } = window.location;
          if (pathname !== loginPath) {
            history.replace(
              `${loginPath}?redirect=${encodeURIComponent(pathname + search + hash)}`,
            );
          }
          message.error('登录已失效，请重新登录');
          return;
        }
        message.error(`请求失败 (${status})`);
        return;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        message.error(
          getIntl().formatMessage({
            id: 'app.request.offline',
            defaultMessage: '网络不可用，请检查连接后重试',
          }),
        );
        return;
      }
      message.error('请求异常，请稍后重试');
    },
  },

  // 请求拦截器：注入 token + 把分页参数转后端约定
  requestInterceptors: [
    (config: RequestOptions) => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${token}`,
        };
      }
      if (isTableLikeRequest(config)) {
        config.params = toBackendQuery((config.params ?? {}) as never);
      }
      return config;
    },
  ],

  // 响应拦截器：用 transform / throwIfBizError 把 {code,message,data} 适配前端的两种消费方式
  //   ① 列表场景：response.data = { data: records[], total: N }
  //   ② 其它场景：response.data = { data: 后端业务字段, success }
  // 这样 service 函数既能用 destructure 取 data，也能让 ProTable request 直接拿 data/total。
  responseInterceptors: [
    (response: any) => {
      const config = response?.config as RequestOptions | undefined;
      const payload = (response?.data ?? response) as BizResponse;
      const bizOk = payload?.code === SUCCESS_CODE;

      if (!bizOk) {
        const err: Error & {
          info?: { errorCode: string; errorMessage: string };
        } = new Error(payload?.message || '业务错误');
        err.name = 'BizError';
        err.info = {
          errorCode: payload?.code ?? '',
          errorMessage: payload?.message || '业务错误',
        };
        throw err;
      }

      if (isTableLikeRequest(config)) {
        // 后端分页响应统一包成 Result<PageResult<T>> = { code, message, data: { total, pageNum, pageSize, pages, records } }
        // 部分接口可能扁平返回 records/total 在外层
        const payloadData = payload?.data as
          | { records?: unknown[]; total?: number }
          | undefined;
        const records =
          (payloadData && Array.isArray(payloadData.records)
            ? payloadData.records
            : Array.isArray(payload?.records)
              ? payload.records
              : []) ?? [];
        const total =
          payloadData?.total ?? (payload as { total?: number })?.total ?? 0;
        return {
          ...response,
          data: {
            data: records,
            total: Number(total) || 0,
            success: true,
          },
        };
      }

      return {
        ...response,
        data: {
          data: payload?.data as unknown,
          success: true,
        },
      };
    },
  ],
};

export { ACCESS_TOKEN_KEY, isDev, loginPath, REFRESH_TOKEN_KEY, SUCCESS_CODE };
