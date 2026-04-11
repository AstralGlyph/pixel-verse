/**
 * @fileoverview 分类服务
 * @description 分类 CRUD、统计每个分类的文章数、安全删除并支持文章重新分配
 * @dependencies drizzle-orm
 */

import { db, categories, posts } from '../db';
import { eq, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';
import { ApiError } from '../utils/errors';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

/** 获取分类列表（带文章数统计） */
export async function getCategories() {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  // 统计每个分类的文章数
  const allPosts = await db.query.posts.findMany({
    columns: { categoryId: true },
  });

  const postCountByCategory: Record<string, number> = {};
  for (const post of allPosts) {
    if (post.categoryId) {
      postCountByCategory[post.categoryId] = (postCountByCategory[post.categoryId] || 0) + 1;
    }
  }

  return allCategories.map((cat) => ({
    ...cat,
    postCount: postCountByCategory[cat.id] || 0,
  }));
}

/** 获取分类详情 */
export async function getCategoryById(id: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });

  if (!category) return null;

  const postCount = (await db.query.posts.findMany({
    where: eq(posts.categoryId, id),
    columns: { id: true },
  })).length;

  return { ...category, postCount };
}

/** 创建分类 */
export async function createCategory(input: CreateCategoryInput) {
  const id = randomUUID();
  let slug = input.slug || generateSlug(input.name);

  const existingSlugs = (await db.select({ slug: categories.slug }).from(categories)).map((c) => c.slug);
  slug = ensureUniqueSlug(slug, existingSlugs);

  await db.insert(categories).values({
    id,
    name: input.name,
    slug,
    description: input.description,
  });

  return getCategoryById(id);
}

/** 更新分类 */
export async function updateCategory(input: UpdateCategoryInput) {
  const existing = await getCategoryById(input.id);
  if (!existing) {
    throw new ApiError('CATEGORY_NOT_FOUND', '分类不存在', 404);
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  if (input.slug !== undefined) {
    const existingSlugs = (await db.select({ slug: categories.slug }).from(categories))
      .map((c) => c.slug)
      .filter((s) => s !== existing.slug);
    updates.slug = ensureUniqueSlug(input.slug, existingSlugs);
  }

  if (Object.keys(updates).length > 0) {
    await db.update(categories).set(updates).where(eq(categories.id, input.id));
  }

  return getCategoryById(input.id);
}

/** 删除分类 */
export async function deleteCategory(id: string, reassignToCategoryId?: string) {
  const existing = await getCategoryById(id);
  if (!existing) {
    throw new ApiError('CATEGORY_NOT_FOUND', '分类不存在', 404);
  }

  // 检查是否有文章使用此分类
  const relatedPosts = await db.query.posts.findMany({
    where: eq(posts.categoryId, id),
    columns: { id: true },
  });

  if (relatedPosts.length > 0) {
    if (reassignToCategoryId) {
      // 重新分配文章到新分类
      await db.update(posts).set({ categoryId: reassignToCategoryId }).where(eq(posts.categoryId, id));
    } else {
      throw new ApiError('CATEGORY_HAS_POSTS', `该分类下有 ${relatedPosts.length} 篇文章，请先重新分配或删除文章`, 400);
    }
  }

  await db.delete(categories).where(eq(categories.id, id));
}
