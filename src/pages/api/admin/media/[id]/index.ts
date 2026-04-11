/**
 * @fileoverview 媒体管理 DELETE API 路由
 * @description 由于 Astro 动态路由限制，DELETE /api/admin/media/:id 需要单独文件
 */

import type { APIRoute } from 'astro';
import { deleteMedia, updateMedia } from '../../../../../lib/services/media.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../../lib/services/audit.service';

/** PUT /api/admin/media/[id] - 更新媒体元信息 */
export const PUT: APIRoute = async ({ locals, params, request }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '媒体 ID 不能为空', 400));

    const body = await request.json();
    if (body.altText !== undefined && typeof body.altText !== 'string') {
      return error(new ApiError('VALIDATION_ERROR', 'altText 必须是字符串', 400));
    }
    const updated = await updateMedia(id, { altText: body.altText });

    await createAuditLog({
      userId,
      action: AuditActions.MEDIA_UPDATED,
      targetType: TargetTypes.MEDIA,
      targetId: id,
    });

    return ok(updated);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新媒体失败'));
  }
};

/** DELETE /api/admin/media/[id] - 删除媒体 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '媒体 ID 不能为空', 400));

    await deleteMedia(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除媒体失败'));
  }
};
