/**
 * @fileoverview Dashboard stats API 路由
 * @description 返回仪表盘统计数据
 */

import type { APIRoute } from 'astro';
import { db, posts, categories, tags, media, auditLog } from '../../../../lib/db';
import { eq, count, desc } from 'drizzle-orm';
import { ok, error, getUserId } from '../../../../api/index';

/** GET /api/admin/dashboard/stats - 获取仪表盘统计数据 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = getUserId({ locals });

    // 获取统计数据
    const totalPosts = await db.select({ count: count() }).from(posts);
    const publishedPosts = await db.select({ count: count() }).from(posts).where(eq(posts.status, 'published'));
    const draftPosts = await db.select({ count: count() }).from(posts).where(eq(posts.status, 'draft'));
    const totalCategories = await db.select({ count: count() }).from(categories);
    const totalTags = await db.select({ count: count() }).from(tags);
    const totalMedia = await db.select({ count: count() }).from(media);

    // 获取最近操作记录
    const recentActivity = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(10);

    return ok({
      totalPosts: totalPosts[0]?.count ?? 0,
      publishedPosts: publishedPosts[0]?.count ?? 0,
      draftPosts: draftPosts[0]?.count ?? 0,
      totalCategories: totalCategories[0]?.count ?? 0,
      totalTags: totalTags[0]?.count ?? 0,
      totalMedia: totalMedia[0]?.count ?? 0,
      recentActivity: recentActivity.map(item => ({
        id: item.id,
        action: item.action,
        target_type: item.targetType,
        target_id: item.targetId,
        created_at: item.createdAt,
      })),
    });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取统计数据失败'));
  }
};
