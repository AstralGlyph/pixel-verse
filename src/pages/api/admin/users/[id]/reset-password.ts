/**
 * @fileoverview 重置用户密码 API 路由
 * @description 超级管理员重置指定用户的密码
 */

import type { APIRoute } from 'astro';
import { resetPassword } from '../../../../../lib/services/user.service';
import { requireSuperAdmin } from '../../../../../lib/utils/permissions';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../../lib/services/audit.service';

/** POST /api/admin/users/:id/reset-password - 重置用户密码 */
export const POST: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '用户 ID 不能为空', 400));

    const body = await parseBody<{ password: string }>(request);
    if (!body.password || body.password.length < 6) {
      return error(new ApiError('VALIDATION_ERROR', '密码长度至少为 6 位', 400));
    }

    await resetPassword(id, body.password);

    // 记录审计日志
    await createAuditLog({
      userId,
      action: AuditActions.PASSWORD_RESET,
      targetType: TargetTypes.USER,
      targetId: id,
    });

    return ok({ message: '密码已重置' });
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('重置密码失败'));
  }
};
