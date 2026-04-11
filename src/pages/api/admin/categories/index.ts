/**
 * @fileoverview 分类管理 API 路由
 * @description 分类列表 GET、创建 POST、按 ID 查询
 */

import type { APIRoute } from 'astro';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../../../../lib/services/category.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/categories - 分类列表 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const result = await getCategories();
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取分类列表失败'));
  }
};

/** POST /api/admin/categories - 创建分类 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{ name: string; slug?: string; description?: string }>(request);

    if (!body.name) {
      return error(new ApiError('VALIDATION_ERROR', '分类名称不能为空', 400));
    }

    const category = await createCategory({
      name: body.name,
      slug: body.slug,
      description: body.description,
    });

    return ok(category);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建分类失败'));
  }
};
