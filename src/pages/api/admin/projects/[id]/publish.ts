/**
 * @fileoverview 发布项目 API
 * @description POST /api/admin/projects/:id/publish
 */

import type { APIRoute } from 'astro';
import { publishProject } from '../../../../../lib/services/project.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** POST /api/admin/projects/:id/publish - 发布项目 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await publishProject(id);
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('发布项目失败'));
  }
};
