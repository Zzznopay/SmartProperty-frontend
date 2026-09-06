import { message } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESS_TOKEN_KEY,
  errorConfig,
  loginPath,
  REFRESH_TOKEN_KEY,
  SUCCESS_CODE,
} from './requestErrorConfig';

vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

const mockReplace = vi.hoisted(() => vi.fn());

vi.mock('@umijs/max', () => ({
  getIntl: vi.fn(() => ({
    formatMessage: vi.fn(({ defaultMessage }) => defaultMessage),
  })),
  history: {
    replace: mockReplace,
  },
}));

describe('requestErrorConfig', () => {
  // biome-ignore lint/style/noNonNullAssertion: config handlers are always defined
  const errorHandler = errorConfig.errorConfig!.errorHandler!;
  const requestInterceptor = errorConfig.requestInterceptors?.[0] as (
    config: Record<string, any>,
  ) => Record<string, any>;
  const responseInterceptor = errorConfig.responseInterceptors?.[0] as (
    response: any,
  ) => any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('errorHandler', () => {
    it('should rethrow error when skipErrorHandler is true', () => {
      const error = new Error('Test error');

      expect(() => {
        errorHandler(error, { skipErrorHandler: true });
      }).toThrow('Test error');
    });

    it('should show errorMessage for BizError', () => {
      const error: any = new Error('biz');
      error.name = 'BizError';
      error.info = { errorCode: 'A0400', errorMessage: '参数校验失败' };

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('参数校验失败');
    });

    it('should fall back to 业务错误 when BizError has no message', () => {
      const error: any = new Error('biz');
      error.name = 'BizError';
      error.info = {};

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('业务错误');
    });

    it('should clear tokens and redirect on 401', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'token-a');
      localStorage.setItem(REFRESH_TOKEN_KEY, 'token-r');
      const error: any = new Error('unauthorized');
      error.response = { status: 401 };

      errorHandler(error, {});

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`${loginPath}?redirect=`),
      );
      expect(message.error).toHaveBeenCalledWith('登录已失效，请重新登录');
    });

    it('should not redirect when already on login page', () => {
      window.history.replaceState(null, '', loginPath);
      const error: any = new Error('unauthorized');
      error.response = { status: 401 };

      errorHandler(error, {});

      expect(mockReplace).not.toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith('登录已失效，请重新登录');

      window.history.replaceState(null, '', '/');
    });

    it('should show status message for non-401 response errors', () => {
      const error: any = new Error('server error');
      error.response = { status: 500 };

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('请求失败 (500)');
    });

    it('should handle offline error', () => {
      const error: any = new Error('Network error');
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      try {
        errorHandler(error, {});

        expect(message.error).toHaveBeenCalledWith(
          '网络不可用，请检查连接后重试',
        );
      } finally {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: originalOnLine,
        });
      }
    });

    it('should handle generic error', () => {
      const error: any = new Error('Generic error');

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('请求异常，请稍后重试');
    });
  });

  describe('requestInterceptors', () => {
    it('should attach Bearer token when present', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'token-1');

      const result = requestInterceptor({ headers: {} });

      expect(result.headers.Authorization).toBe('Bearer token-1');
    });

    it('should not attach Authorization header without token', () => {
      const result = requestInterceptor({ headers: {} });

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should convert ProTable pagination params to backend convention', () => {
      const result = requestInterceptor({
        method: 'GET',
        params: { current: 2, pageSize: 20, name: 'foo' },
      });

      expect(result.params).toEqual({ pageNum: 2, pageSize: 20, name: 'foo' });
    });

    it('should not touch params for non-table-like requests', () => {
      const params = { name: 'foo' };
      const result = requestInterceptor({
        method: 'POST',
        params,
      });

      expect(result.params).toBe(params);
    });
  });

  describe('responseInterceptors', () => {
    it('should unwrap biz payload for normal requests', () => {
      const response = {
        data: { code: SUCCESS_CODE, message: 'ok', data: { id: 1 } },
      };

      const result = responseInterceptor(response);

      expect(result.data).toEqual({ data: { id: 1 }, success: true });
    });

    it('should unwrap page payload for table-like requests', () => {
      const response = {
        config: { method: 'GET', params: { current: 1, pageSize: 10 } },
        data: {
          code: SUCCESS_CODE,
          data: { records: [{ id: 1 }], total: 11 },
        },
      };

      const result = responseInterceptor(response);

      expect(result.data).toEqual({
        data: [{ id: 1 }],
        total: 11,
        success: true,
      });
    });

    it('should throw BizError when biz code is not success', () => {
      const response = {
        data: { code: 'B0010', message: '无权限' },
      };

      expect.assertions(3);
      try {
        responseInterceptor(response);
        expect.unreachable('should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('无权限');
        expect(error.name).toBe('BizError');
        expect(error.info).toEqual({
          errorCode: 'B0010',
          errorMessage: '无权限',
        });
      }
    });
  });
});
