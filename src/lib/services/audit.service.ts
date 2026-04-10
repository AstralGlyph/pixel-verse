/**
 * @fileoverview 审计日志服务
 * @description 记录关键业务操作（用户创建/删除、文章发布/删除、页面发布等）
 * @dependencies drizzle-orm
 */

import { db, auditLog } from '../db';
import { desc, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface AuditLogInput {
  userId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/** 记录审计日志 */
export async function createAuditLog(input: AuditLogInput) {
  const id = randomUUID();
  await db.insert(auditLog).values({
    id,
    userId: input.userId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    details: input.details ? JSON.stringify(input.details) : null,
    ipAddress: input.ipAddress,
    createdAt: new Date().toISOString(),
  });
}

/** 获取审计日志列表（分页） */
export async function getAuditLogs(options?: {
  userId?: string;
  action?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, action, targetType, limit = 50, offset = 0 } = options || {};

  let query = db.query.auditLog.findMany({
    with: {
      user: { columns: { id: true, username: true, email: true } },
    },
    orderBy: [desc(auditLog.createdAt)],
    limit,
    offset,
  });

  // 手动过滤（Drizzle ORM 对 SQLite 的条件查询支持有限）
  const logs = await query;

  return logs.filter(log => {
    if (userId && log.userId !== userId) return false;
    if (action && !log.action.includes(action)) return false;
    if (targetType && log.targetType !== targetType) return false;
    return true;
  });
}

/** 获取审计日志总数 */
export async function getAuditLogsCount(): Promise<number> {
  const result = await db.select({ count: db.$count(auditLog) }).from(auditLog);
  return result[0]?.count || 0;
}

/** 常用操作类型常量 */
export const AuditActions = {
  USER_CREATED: 'user.created',
  USER_DELETED: 'user.deleted',
  USER_UPDATED: 'user.updated',
  PASSWORD_RESET: 'password.reset',
  PASSWORD_CHANGED: 'user.password_changed',
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  POST_PUBLISHED: 'post.published',
  POST_UNPUBLISHED: 'post.unpublished',
  POST_UNARCHIVED: 'post.unarchived',
  PAGE_CREATED: 'page.created',
  PAGE_UPDATED: 'page.updated',
  PAGE_DELETED: 'page.deleted',
  PAGE_PUBLISHED: 'page.published',
  PAGE_UNPUBLISHED: 'page.unpublished',
  MEDIA_UPLOADED: 'media.uploaded',
  MEDIA_UPDATED: 'media.updated',
  MEDIA_DELETED: 'media.deleted',
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',
  TAG_CREATED: 'tag.created',
  TAG_UPDATED: 'tag.updated',
  TAG_DELETED: 'tag.deleted',
} as const;

export const TargetTypes = {
  USER: 'user',
  POST: 'post',
  PAGE: 'page',
  MEDIA: 'media',
  CATEGORY: 'category',
  TAG: 'tag',
} as const;
