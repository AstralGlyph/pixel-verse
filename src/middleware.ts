/**
 * @fileoverview Astro 认证中间件
 * @description 会话验证和路由保护
 * @dependencies astro/middleware
 */

import { defineMiddleware } from 'astro:middleware';
import { validateSession, getSessionIdFromCookie } from './lib/services/session.service';

// 需要认证的路由前缀
const PROTECTED_PREFIXES = ['/admin', '/api/admin'];

// 公开路由（不需要认证）
const PUBLIC_PATHS = ['/admin', '/api/admin/auth/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, headers } = context.request;
  const pathname = new URL(url).pathname;

  console.log('[Middleware] Path:', pathname, 'Is public:', PUBLIC_PATHS.includes(pathname));

  // 公开路由直接放行
  if (PUBLIC_PATHS.includes(pathname)) {
    return next();
  }

  // 检查是否需要认证
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return next();
  }

  // 提取会话 ID
  const cookieHeader = headers.get('cookie') ?? undefined;
  const sessionId = getSessionIdFromCookie(cookieHeader);

  if (!sessionId) {
    // API 请求返回 JSON 错误
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '请先登录' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // 页面请求重定向到登录页
    return context.redirect('/admin');
  }

  // 验证会话
  const userId = await validateSession(sessionId);
  if (!userId) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '会话已过期，请重新登录' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin');
  }

  // 将用户 ID 存储到 locals 中供后续使用
  context.locals.userId = userId;

  return next();
});
