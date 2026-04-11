/**
 * @fileoverview 页面详情/操作 API 路由
 * @description 按 ID 查询 GET、更新 PUT、删除 DELETE、发布 POST
 */

import type { APIRoute } from 'astro';
import { getPageById, updatePage, deletePage, publishPage, unpublishPage } from '../../../../../lib/services/page.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/pages-cms/:id - 获取页面详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '页面 ID 不能为空', 400));

    const page = await getPageById(id);
    if (!page) return error(new ApiError('PAGE_NOT_FOUND', '页面不存在', 404));

    return ok(page);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取页面失败'));
  }
};

/** PUT /api/admin/pages-cms/:id - 更新页面 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '页面 ID 不能为空', 400));

    const body = await parseBody<{
      title?: string;
      slug?: string;
      content?: string;
      seoTitle?: string;
      seoDescription?: string;
    }>(request);

    const page = await updatePage({ id, ...body });
    return ok(page);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新页面失败'));
  }
};

/** DELETE /api/admin/pages-cms/:id - 删除页面 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '页面 ID 不能为空', 400));

    await deletePage(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除页面失败'));
  }
};

/** POST /api/admin/pages-cms/:id/publish - 发布页面 */
export const publish: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '页面 ID 不能为空', 400));

    const page = await publishPage(id);
    return ok(page);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('发布页面失败'));
  }
};

/** POST /api/admin/pages-cms/:id/unpublish - 下线页面 */
export const unpublish: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '页面 ID 不能为空', 400));

    const page = await unpublishPage(id);
    return ok(page);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('下线页面失败'));
  }
};
