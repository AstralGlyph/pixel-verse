/**
 * @fileoverview 公开博客 API 路由
 * @description 前台 SSR 页面使用的文章查询接口，仅返回已发布文章
 */

import type { APIRoute } from 'astro';
import { getPostBySlug, getPublishedPosts } from '../../../lib/services/post.service';
import { ok, error } from '../../../api/index';

/** GET /api/posts - 获取已发布文章列表 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '10'), 50);

    const result = await getPublishedPosts(page, perPage);
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取文章列表失败'));
  }
};
