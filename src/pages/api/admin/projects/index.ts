/**
 * @fileoverview 后台项目管理 API — 列表/创建
 * @description GET /api/admin/projects — 项目列表（分页/筛选）
 * @description POST /api/admin/projects — 创建项目
 */

import type { APIRoute } from 'astro';
import { listProjects, createProject } from '../../../../lib/services/project.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/projects — 项目列表 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    getUserId({ locals });
    const url = new URL(request.url);
    const result = await listProjects({
      status: url.searchParams.get('status') || undefined,
      featured: url.searchParams.get('featured') === 'true' ? true : url.searchParams.get('featured') === 'false' ? false : undefined,
      keyword: url.searchParams.get('keyword') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      perPage: Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100),
    });
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目列表失败'));
  }
};

/** POST /api/admin/projects — 创建项目 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{
      title: string;
      slug?: string;
      description?: string;
      coverImageId?: string;
      content: string;
      demoUrl?: string;
      sourceUrl?: string;
      tagIds?: string[];
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      featured?: boolean;
    }>(request);

    if (!body.title || !body.content) {
      return error(new ApiError('VALIDATION_ERROR', '标题和内容不能为空', 400));
    }

    const project = await createProject({
      ...body,
      authorId: userId,
    });

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建项目失败'));
  }
};
