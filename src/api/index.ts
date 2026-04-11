/**
 * @fileoverview API 路由基础结构
 * @description 标准化 API 响应格式和错误处理
 */

import type { APIRoute } from 'astro';
import { successResponse, errorResponse, ApiError } from '../lib/utils/errors';

/** 创建标准化的 JSON 响应 */
export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** 创建成功响应 */
export function ok<T>(data: T): Response {
  return json(successResponse(data), 200);
}

/** 创建创建成功响应 (201) */
export function created<T>(data: T): Response {
  return json(successResponse(data), 201);
}

/** 创建无内容响应 (204) */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/** 创建错误响应 */
export function error(err: ApiError | Error): Response {
  const body = errorResponse(err);
  const status = err instanceof ApiError ? err.status : 500;
  return json(body, status);
}

/** 从请求中提取用户 ID */
export function getUserId(context: { locals: { userId?: string } }): string {
  if (!context.locals.userId) {
    throw new ApiError('UNAUTHORIZED', '请先登录', 401);
  }
  return context.locals.userId;
}

/** 解析 JSON 请求体 */
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new ApiError('INVALID_JSON', '请求体格式不正确', 400);
  }
}
