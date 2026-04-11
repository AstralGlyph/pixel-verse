/**
 * @fileoverview 标签详情/操作 API 路由
 * @description 按 ID 查询 GET、更新 PUT、删除 DELETE
 */

import type { APIRoute } from 'astro';
import { getTagById, updateTag, deleteTag } from '../../../../../lib/services/tag.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/tags/:id - 获取标签详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '标签 ID 不能为空', 400));

    const tag = await getTagById(id);
    if (!tag) return error(new ApiError('TAG_NOT_FOUND', '标签不存在', 404));

    return ok(tag);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取标签失败'));
  }
};

/** PUT /api/admin/tags/:id - 更新标签 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '标签 ID 不能为空', 400));

    const body = await parseBody<{ name?: string; slug?: string }>(request);

    const tag = await updateTag({ id, ...body });
    return ok(tag);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新标签失败'));
  }
};

/** DELETE /api/admin/tags/:id - 删除标签 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '标签 ID 不能为空', 400));

    await deleteTag(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除标签失败'));
  }
};
