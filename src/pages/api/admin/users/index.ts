/**
 * @fileoverview 用户管理 API 路由
 * @description 用户列表 GET、创建 POST（仅超级管理员）
 */

import type { APIRoute } from 'astro';
import { getUsers, createUser } from '../../../../lib/services/user.service';
import { requireSuperAdmin } from '../../../../lib/utils/permissions';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/users - 用户列表 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const result = await getUsers();
    return ok(result);
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('获取用户列表失败'));
  }
};

/** POST /api/admin/users - 创建用户 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const body = await parseBody<{
      username: string;
      password: string;
      email: string;
      roleId: string;
    }>(request);

    if (!body.username || !body.password || !body.email || !body.roleId) {
      return error(new ApiError('VALIDATION_ERROR', '所有字段均为必填', 400));
    }

    const user = await createUser({
      username: body.username,
      password: body.password,
      email: body.email,
      roleId: body.roleId,
    });

    return ok(user);
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('创建用户失败'));
  }
};
