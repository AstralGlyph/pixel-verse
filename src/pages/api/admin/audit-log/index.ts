/**
 * @fileoverview 审计日志 API 路由
 * @description 审计日志列表查询（仅超级管理员）
 */

import type { APIRoute } from 'astro';
import { getAuditLogs, getAuditLogsCount } from '../../../../lib/services/audit.service';
import { requireSuperAdmin } from '../../../../lib/utils/permissions';
import { ok, error, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/audit-log - 审计日志列表 */
export const GET: APIRoute = async ({ request, locals, url }) => {
  try {
    const userId = getUserId({ locals });
    await requireSuperAdmin(userId);

    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const action = url.searchParams.get('action') || undefined;
    const targetType = url.searchParams.get('targetType') || undefined;

    const offset = (page - 1) * limit;
    const logs = await getAuditLogs({ userId: undefined, action, targetType, limit, offset });
    const total = await getAuditLogsCount();

    return ok({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return error(err);
    return error(err instanceof Error ? err : new Error('获取审计日志失败'));
  }
};
