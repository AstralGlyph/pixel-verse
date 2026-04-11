/**
 * @fileoverview 发布文章 API 路由
 * @description POST /api/admin/posts/:id/publish
 */

import type { APIRoute } from 'astro';
import { publishPost } from '../../../../../lib/services/post.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** POST /api/admin/posts/:id/publish - 发布文章 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const post = await publishPost(id);
    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('发布文章失败'));
  }
};
