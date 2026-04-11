/**
 * @fileoverview 认证 API 路由
 * @description 登录、登出、获取当前用户信息
 */

import type { APIRoute } from 'astro';
import { login, getUserById } from '../lib/services/auth.service';
import { createSession, destroySession, getSessionIdFromCookie, createSessionCookie, clearSessionCookie } from '../lib/services/session.service';
import { ok, error, parseBody, getUserId } from './index';
import { ApiError } from '../lib/utils/errors';

/** POST /api/admin/auth/login - 用户登录 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await parseBody<{ username: string; password: string }>(request);

    if (!body.username || !body.password) {
      return error(new ApiError('VALIDATION_ERROR', '用户名和密码不能为空', 400, ['username', 'password']));
    }

    const result = await login(body.username, body.password);
    const sessionId = await createSession(result.user.id);

    return new Response(JSON.stringify({ data: { user: result.user } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(sessionId),
      },
    });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('登录失败'));
  }
};

/** GET /api/admin/auth/me - 获取当前用户 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const user = await getUserById(userId);

    if (!user) {
      return error(new ApiError('USER_NOT_FOUND', '用户不存在', 404));
    }

    return ok({ user });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取用户信息失败'));
  }
};

/** POST /api/admin/auth/logout - 用户登出 */
export const POST_LOGOUT: APIRoute = async ({ request, cookies }) => {
  try {
    const cookieHeader = request.headers.get('cookie') ?? undefined;
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (sessionId) {
      await destroySession(sessionId);
    }

    return new Response(null, {
      status: 204,
      headers: {
        'Set-Cookie': clearSessionCookie(),
      },
    });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('登出失败'));
  }
};
