/**
 * @fileoverview 恢复归档文章 API 路由
 * @description POST /api/admin/posts/:id/unarchive
 */

import type { APIRoute } from 'astro';
import { unarchivePost } from '../../../../../lib/services/post.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../../lib/services/audit.service';

/** POST /api/admin/posts/:id/unarchive - 恢复归档文章 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const post = await unarchivePost(id);

    await createAuditLog({
      userId,
      action: AuditActions.POST_UNARCHIVED,
      targetType: TargetTypes.POST,
      targetId: id,
    });

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('恢复文章失败'));
  }
};
