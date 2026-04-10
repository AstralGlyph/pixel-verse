/**
 * @fileoverview 用户自行修改密码 API 路由
 * @description POST /api/admin/auth/change-password
 */

import type { APIRoute } from 'astro';
import { changePassword } from '../../../../lib/services/auth.service';
import { ok, error, getUserId, parseBody } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../lib/services/audit.service';

/** POST /api/admin/auth/change-password - 修改密码 */
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{ currentPassword: string; newPassword: string }>(request);

    if (!body.currentPassword || !body.newPassword) {
      return error(new ApiError('VALIDATION_ERROR', '当前密码和新密码均不能为空', 400));
    }

    await changePassword(userId, body.currentPassword, body.newPassword);

    // 记录审计日志
    await createAuditLog({
      userId,
      action: AuditActions.PASSWORD_CHANGED,
      targetType: TargetTypes.USER,
      targetId: userId,
    });

    return ok({ message: '密码已修改' });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('修改密码失败'));
  }
};
