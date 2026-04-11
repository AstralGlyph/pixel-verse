/**
 * @fileoverview 仪表盘统计 API
 * @description 返回内容统计概览
 */

import type { APIRoute } from 'astro';
import { db, posts, categories, tags, media, pages, auditLog } from '../lib/db';
import { desc, count, eq } from 'drizzle-orm';
import { ok, error, getUserId } from './index';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = getUserId({ locals });

    // 统计文章数量
    const allPosts = await db.select({ status: posts.status }).from(posts);
    const totalPosts = allPosts.length;
    const publishedPosts = allPosts.filter((p) => p.status === 'published').length;
    const draftPosts = allPosts.filter((p) => p.status === 'draft').length;

    // 统计分类、标签、媒体、页面
    const allCategories = await db.select({ id: categories.id }).from(categories);
    const allTags = await db.select({ id: tags.id }).from(tags);
    const allMedia = await db.select({ id: media.id }).from(media);
    const allPages = await db.select({ id: pages.id }).from(pages);

    // 最近操作
    const recentLogs = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        createdAt: auditLog.createdAt,
        user: { username: auditLog.userId },
      })
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(10);

    return ok({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCategories: allCategories.length,
        totalTags: allTags.length,
        totalMedia: allMedia.length,
        totalPages: allPages.length,
      },
      recentActivity: recentLogs,
    });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取统计数据失败'));
  }
};
