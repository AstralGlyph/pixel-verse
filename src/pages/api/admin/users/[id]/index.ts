/**
 * @fileoverview 用户详情/操作 API 路由
 * @description 按 ID 查询 GET、更新角色 PUT、删除 DELETE
 */

import type { APIRoute } from 'astro';
import { getUserById, updateUser, deleteUser } from '../../../../../lib/services/user.service';
import { requireSuperAdmin } from '../../../../../lib/utils/permissions';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/users/:id - 获取用户详情 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '用户 ID 不能为空', 400));

    const user = await getUserById(id);
    if (!user) return error(new ApiError('USER_NOT_FOUND', '用户不存在', 404));

    return ok(user);
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('获取用户失败'));
  }
};

/** PUT /api/admin/users/:id - 更新用户角色 */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '用户 ID 不能为空', 400));

    const body = await parseBody<{ username?: string; email?: string; roleId?: string }>(request);

    const user = await updateUser({ id, ...body });
    return ok(user);
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('更新用户失败'));
  }
};

/** DELETE /api/admin/users/:id - 删除用户 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '用户 ID 不能为空', 400));

    // 不允许删除自己
    if (id === userId) {
      return error(new ApiError('FORBIDDEN', '不能删除自己的账号', 400));
    }

    await deleteUser(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('删除用户失败'));
  }
};
