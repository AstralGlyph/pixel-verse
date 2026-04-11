/**
 * @fileoverview 用户自行更新个人资料 API 路由
 * @description 允许已登录用户修改自己的用户名和邮箱（无需管理员权限）
 */

import type { APIRoute } from 'astro';
import { db, users } from '../../../../lib/db';
import { eq } from 'drizzle-orm';
import { getUserId, parseBody, ok, error } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../lib/services/audit.service';

/** PUT /api/admin/auth/profile - 用户自行更新个人资料 */
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    if (!userId) {
      return error(new ApiError('UNAUTHORIZED', '未登录', 401));
    }

    const body = await parseBody<{ username?: string; email?: string }>(request);

    // 只允许更新用户名和邮箱
    const updates: Record<string, unknown> = {};
    if (body.username !== undefined) updates.username = body.username;
    if (body.email !== undefined) updates.email = body.email;

    if (Object.keys(updates).length === 0) {
      return error(new ApiError('VALIDATION_ERROR', '没有需要更新的字段', 400));
    }

    // 检查用户名是否已被其他用户使用
    if (body.username) {
      const existing = await db.query.users.findFirst({
        where: eq(users.username, body.username),
      });
      if (existing && existing.id !== userId) {
        return error(new ApiError('USERNAME_EXISTS', '用户名已存在', 409));
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (body.email) {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });
      if (existingEmail && existingEmail.id !== userId) {
        return error(new ApiError('EMAIL_EXISTS', '邮箱已被使用', 409));
      }
    }

    // 更新用户资料
    const now = new Date().toISOString();
    await db.update(users).set({ ...updates, updatedAt: now }).where(eq(users.id, userId));

    // 获取更新后的用户信息
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { role: { columns: { id: true, name: true, displayName: true } } },
    });

    if (!updatedUser) {
      return error(new ApiError('USER_NOT_FOUND', '用户不存在', 404));
    }

    // 记录审计日志
    await createAuditLog({
      userId,
      action: AuditActions.USER_UPDATED,
      targetType: TargetTypes.USER,
      targetId: userId,
      details: { fields: Object.keys(updates) },
    });

    return ok({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('更新个人资料失败'));
  }
};
