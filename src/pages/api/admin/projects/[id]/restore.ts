/**
 * @fileoverview 恢复归档项目 API
 * @description POST /api/admin/projects/:id/restore
 */

import type { APIRoute } from 'astro';
import { restoreProject } from '../../../../../lib/services/project.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** POST /api/admin/projects/:id/restore - 恢复归档 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await restoreProject(id);
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('恢复失败'));
  }
};
