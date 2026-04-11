/**
 * @fileoverview 标签管理 API 路由
 * @description 标签列表 GET、创建 POST
 */

import type { APIRoute } from 'astro';
import { getTags, getTagById, createTag, updateTag, deleteTag } from '../../../../lib/services/tag.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/tags - 标签列表 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const result = await getTags();
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取标签列表失败'));
  }
};

/** POST /api/admin/tags - 创建标签 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{ name: string; slug?: string }>(request);

    if (!body.name) {
      return error(new ApiError('VALIDATION_ERROR', '标签名称不能为空', 400));
    }

    const tag = await createTag({
      name: body.name,
      slug: body.slug,
    });

    return ok(tag);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建标签失败'));
  }
};
