// 公共分页参数
export type PageParams = {
  current?: number;
  pageSize?: number;
  [key: string]: unknown;
};

// 后端分页响应已经由 requestErrorConfig 自动解包，统一返回结构见 ProTable
export type PageResult<T> = {
  data: T[];
  total: number;
};
