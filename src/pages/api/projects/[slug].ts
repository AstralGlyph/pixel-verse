/**
 * @fileoverview 公开项目详情 API
 * @description GET /api/projects/:slug — 获取单个已发布项目详情
 */

import type { APIRoute } from 'astro';
import { getProjectBySlug } from '../../../lib/services/project.service';
import { ok, error } from '../../../api/index';
import { ApiError } from '../../../lib/utils/errors';

/** GET /api/projects/:slug — 项目详情 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug;
    if (!slug) return error(new ApiError('VALIDATION_ERROR', '项目 slug 不能为空', 400));

    const project = await getProjectBySlug(slug);
    if (!project) return error(new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404));

    // 只返回已发布的项目
    if (project.status !== 'published') {
      return error(new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404));
    }

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目详情失败'));
  }
};
