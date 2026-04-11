/**
 * @fileoverview 获取当前用户信息 API 路由
 * @description GET /api/admin/auth/me - 返回当前登录用户信息
 */

import type { APIRoute } from 'astro';
import { getUserById } from '../../../../lib/services/auth.service';
import { ok, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/auth/me - 获取当前用户 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = getUserId({ locals });
    const user = await getUserById(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: { code: 'USER_NOT_FOUND', message: '用户不存在' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return ok({ user });
  } catch (err) {
    if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '请先登录' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: '获取用户信息失败' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
