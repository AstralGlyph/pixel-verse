/**
 * @fileoverview 项目浏览计数 API
 * @description POST /api/projects/:slug/view — IP 去重 + 异步写入，同一 IP 24h 内仅计一次
 */

import type { APIRoute } from 'astro';
import { getProjectBySlug, incrementViewCount } from '../../../../lib/services/project.service';
import { ok, error } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

// 内存缓存：记录 IP + 项目 ID 的最后访问时间
const viewCache = new Map<string, number>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

/** POST /api/projects/:slug/view — 记录浏览 */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug;
    if (!slug) return error(new ApiError('VALIDATION_ERROR', '项目 slug 不能为空', 400));

    const project = await getProjectBySlug(slug);
    if (!project || project.status !== 'published') {
      return error(new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404));
    }

    // 获取客户端 IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const cacheKey = `${ip}:${project.id}`;
    const lastViewed = viewCache.get(cacheKey);

    if (!lastViewed || Date.now() - lastViewed > CACHE_TTL) {
      viewCache.set(cacheKey, Date.now());
      await incrementViewCount(project.id);
    }

    return ok({ viewed: true });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('记录浏览失败'));
  }
};
