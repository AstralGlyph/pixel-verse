/**
 * @fileoverview 后台项目详情/操作 API 路由
 * @description 项目详情 GET、更新 PUT、删除 DELETE
 */

import type { APIRoute } from 'astro';
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '../../../../../lib/services/project.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/projects/:id - 获取项目详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await getProjectById(id);
    if (!project) return error(new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404));

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目详情失败'));
  }
};

/** PUT /api/admin/projects/:id - 更新项目 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const body = await parseBody<{
      title?: string;
      slug?: string;
      description?: string;
      coverImageId?: string;
      content?: string;
      demoUrl?: string;
      sourceUrl?: string;
      tagIds?: string[];
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      featured?: boolean;
    }>(request);

    const project = await updateProject({
      id,
      ...body,
    });

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新项目失败'));
  }
};

/** DELETE /api/admin/projects/:id - 删除项目 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    await deleteProject(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除项目失败'));
  }
};
