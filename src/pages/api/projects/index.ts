/**
 * @fileoverview 公开项目列表 API
 * @description GET /api/projects — 获取已发布项目列表
 */

import type { APIRoute } from 'astro';
import { getPublicProjects } from '../../../lib/services/project.service';
import { ok, error } from '../../../api/index';

/** GET /api/projects — 已发布项目列表 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get('featured') === 'true';
    const projects = await getPublicProjects({ featured });
    return ok(projects);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目列表失败'));
  }
};
