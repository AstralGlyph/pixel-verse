/**
 * @fileoverview 后台文章管理 API 路由
 * @description 文章列表 GET、创建 POST
 */

import type { APIRoute } from 'astro';
import { getPosts, createPost } from '../../../../lib/services/post.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/posts - 文章列表 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const params = {
      status: url.searchParams.get('status') || undefined,
      categoryId: url.searchParams.get('category_id') || undefined,
      tagId: url.searchParams.get('tag_id') || undefined,
      authorId: url.searchParams.get('author_id') || undefined,
      dateFrom: url.searchParams.get('date_from') || undefined,
      dateTo: url.searchParams.get('date_to') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      perPage: Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100),
      sort: url.searchParams.get('sort') || 'created_at',
      order: (url.searchParams.get('order') || 'desc') as 'asc' | 'desc',
    };

    const result = await getPosts(params);
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取文章列表失败'));
  }
};

/** POST /api/admin/posts - 创建文章 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{
      title: string;
      slug?: string;
      content: string;
      excerpt?: string;
      coverImageId?: string;
      status?: string;
      categoryId?: string;
      tagIds?: string[];
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
    }>(request);

    if (!body.title || !body.content) {
      return error(new ApiError('VALIDATION_ERROR', '标题和内容不能为空', 400, ['title', 'content']));
    }

    const post = await createPost({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImageId: body.coverImageId,
      status: body.status as 'draft' | 'published' | 'archived' | undefined,
      authorId: userId,
      categoryId: body.categoryId,
      tagIds: body.tagIds,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
    });

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建文章失败'));
  }
};
