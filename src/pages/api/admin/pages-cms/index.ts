/**
 * @fileoverview 页面管理 API 路由
 * @description 页面列表 GET、创建 POST
 */

import type { APIRoute } from 'astro';
import { getPages, createPage } from '../../../../lib/services/page.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/pages-cms - 页面列表 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    getUserId({ locals });
    const result = await getPages();
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取页面列表失败'));
  }
};

/** POST /api/admin/pages-cms - 创建页面 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    getUserId({ locals });
    const body = await parseBody<{
      title: string;
      slug?: string;
      content: string;
      seoTitle?: string;
      seoDescription?: string;
    }>(request);

    if (!body.title || !body.content) {
      return error(new ApiError('VALIDATION_ERROR', '标题和内容不能为空', 400));
    }

    const page = await createPage({
      title: body.title,
      slug: body.slug,
      content: body.content,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
    });

    return ok(page);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建页面失败'));
  }
};
