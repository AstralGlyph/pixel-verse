/**
 * @fileoverview 取消发布文章 API 路由
 * @description POST /api/admin/posts/:id/unpublish
 */

import type { APIRoute } from 'astro';
import { unpublishPost } from '../../../../../lib/services/post.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** POST /api/admin/posts/:id/unpublish - 取消发布文章 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const post = await unpublishPost(id);
    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('取消发布失败'));
  }
};
