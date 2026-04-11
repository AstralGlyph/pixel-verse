/**
 * @fileoverview 登出 API 路由
 * @description 用户登出
 */

import type { APIRoute } from 'astro';
import { destroySession, getSessionIdFromCookie, clearSessionCookie } from '../../../../lib/services/session.service';
import { error } from '../../../../api/index';

/** POST /api/admin/auth/logout - 用户登出 */
export const POST: APIRoute = async ({ request }) => {
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
