/**
 * @fileoverview 公开博客文章 API 路由
 * @description 按 slug 获取已发布文章详情
 */

import type { APIRoute } from 'astro';
import { getPostBySlug } from '../../../lib/services/post.service';
import { ok, error } from '../../../api/index';

/** GET /api/posts/:slug - 按 slug 获取文章详情 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug;
    if (!slug) return error(new Error('文章别名不能为空'));

    const post = await getPostBySlug(slug);
    if (!post || post.status !== 'published') {
      return error(new Error('文章不存在'));
    }

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取文章失败'));
  }
};
