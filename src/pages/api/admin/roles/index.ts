/**
 * @fileoverview 角色管理 API 路由
 * @description 角色列表 GET（仅超级管理员），内置角色只读
 */

import type { APIRoute } from 'astro';
import { getRoles } from '../../../../lib/services/user.service';
import { requireSuperAdmin } from '../../../../lib/utils/permissions';
import { ok, error, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/roles - 角色列表 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const roles = await getRoles();
    const result = roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      // 内置角色标记为只读
      readOnly: ['super_admin', 'editor', 'author'].includes(role.name),
    }));

    return ok(result);
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('获取角色列表失败'));
  }
};
