/**
 * @fileoverview 会话管理服务
 * @description 创建、验证、销毁会话，Cookie 辅助方法
 * @dependencies better-sqlite3, uuid, crypto
 */

import { db, sessions } from '../db';
import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天

/** 创建新会话 */
export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

/** 验证会话，返回用户 ID 或 null */
export async function validateSession(sessionId: string): Promise<string | null> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { user: true },
  });

  if (!session) return null;

  // 检查是否过期
  if (new Date(session.expiresAt) < new Date()) {
    await destroySession(sessionId);
    return null;
  }

  return session.userId;
}

/** 销毁会话 */
export async function destroySession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/** 清理过期会话 */
export async function cleanupExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString()));
}

/** 生成 Set-Cookie 头部 */
export function createSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

/** 生成清除 Cookie 的头部 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/** 从 Cookie 字符串中提取会话 ID */
export function getSessionIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  return match ? match[1] : null;
}
