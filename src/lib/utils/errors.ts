/**
 * @fileoverview 错误处理工具
 * @description 标准化 API 错误响应格式
 */

/** API 错误类型 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public fields?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 标准化错误响应 */
export function errorResponse(error: ApiError | Error): { error: { code: string; message: string; fields?: string[] } } {
  if (error instanceof ApiError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
    };
  }
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message || '内部服务器错误',
    },
  };
}

/** 标准化成功响应 */
export function successResponse<T>(data: T, meta?: Record<string, unknown>): { data: T; meta?: Record<string, unknown> } {
  return { data, ...(meta && { meta }) };
}

/** 分页响应 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  perPage: number,
  total: number
): { data: T[]; pagination: { page: number; per_page: number; total: number; total_pages: number } } {
  return {
    data,
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  };
}
