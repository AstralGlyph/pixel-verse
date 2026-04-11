/**
 * @fileoverview 分类详情/操作 API 路由
 * @description 按 ID 查询 GET、更新 PUT、删除 DELETE
 */

import type { APIRoute } from 'astro';
import { getCategoryById, updateCategory, deleteCategory } from '../../../../../lib/services/category.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/categories/:id - 获取分类详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '分类 ID 不能为空', 400));

    const category = await getCategoryById(id);
    if (!category) return error(new ApiError('CATEGORY_NOT_FOUND', '分类不存在', 404));

    return ok(category);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取分类失败'));
  }
};

/** PUT /api/admin/categories/:id - 更新分类 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '分类 ID 不能为空', 400));

    const body = await parseBody<{ name?: string; slug?: string; description?: string }>(request);

    const category = await updateCategory({ id, ...body });
    return ok(category);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新分类失败'));
  }
};

/** DELETE /api/admin/categories/:id - 删除分类 */
export const DELETE: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '分类 ID 不能为空', 400));

    // 获取重新分配的目标分类
    const url = new URL(request.url);
    const reassignTo = url.searchParams.get('reassign_to') || undefined;

    await deleteCategory(id, reassignTo);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除分类失败'));
  }
};
