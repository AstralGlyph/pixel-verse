/**
 * @fileoverview 后台文章详情/操作 API 路由
 * @description 文章详情 GET、更新 PUT、删除 DELETE、发布 POST
 */

import type { APIRoute } from 'astro';
import {
  getPostById,
  updatePost,
  deletePost,
} from '../../../../../lib/services/post.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/posts/:id - 获取文章详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const post = await getPostById(id);
    if (!post) return error(new ApiError('POST_NOT_FOUND', '文章不存在', 404));

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取文章失败'));
  }
};

/** PUT /api/admin/posts/:id - 更新文章 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const body = await parseBody<{
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverImageId?: string;
      status?: string;
      categoryId?: string;
      tagIds?: string[];
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
    }>(request);

    const post = await updatePost({
      id,
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImageId: body.coverImageId,
      status: body.status as 'draft' | 'published' | 'archived' | undefined,
      categoryId: body.categoryId,
      tagIds: body.tagIds,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
    });

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新文章失败'));
  }
};

/** DELETE /api/admin/posts/:id - 删除文章 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    await deletePost(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除文章失败'));
  }
};

