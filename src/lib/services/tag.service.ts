/**
 * @fileoverview 标签服务
 * @description 标签 CRUD、统计每个标签的文章数、安全删除并确认
 * @dependencies drizzle-orm
 */

import { db, tags, postTags } from '../db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';
import { ApiError } from '../utils/errors';

export interface CreateTagInput {
  name: string;
  slug?: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: string;
}

/** 获取标签列表（带文章数统计） */
export async function getTags() {
  const allTags = await db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  });

  // 统计每个标签的文章数
  const allPostTags = await db.query.postTags.findMany({
    columns: { tagId: true },
  });

  const postCountByTag: Record<string, number> = {};
  for (const pt of allPostTags) {
    postCountByTag[pt.tagId] = (postCountByTag[pt.tagId] || 0) + 1;
  }

  return allTags.map((tag) => ({
    ...tag,
    postCount: postCountByTag[tag.id] || 0,
  }));
}

/** 获取标签详情 */
export async function getTagById(id: string) {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });

  if (!tag) return null;

  const postCount = (await db.query.postTags.findMany({
    where: eq(postTags.tagId, id),
    columns: { tagId: true },
  })).length;

  return { ...tag, postCount };
}

/** 创建标签 */
export async function createTag(input: CreateTagInput) {
  const id = randomUUID();
  let slug = input.slug || generateSlug(input.name);

  const existingSlugs = (await db.select({ slug: tags.slug }).from(tags)).map((t) => t.slug);
  slug = ensureUniqueSlug(slug, existingSlugs);

  await db.insert(tags).values({
    id,
    name: input.name,
    slug,
  });

  return getTagById(id);
}

/** 更新标签 */
export async function updateTag(input: UpdateTagInput) {
  const existing = await getTagById(input.id);
  if (!existing) {
    throw new ApiError('TAG_NOT_FOUND', '标签不存在', 404);
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name;

  if (input.slug !== undefined) {
    const existingSlugs = (await db.select({ slug: tags.slug }).from(tags))
      .map((t) => t.slug)
      .filter((s) => s !== existing.slug);
    updates.slug = ensureUniqueSlug(input.slug, existingSlugs);
  }

  if (Object.keys(updates).length > 0) {
    await db.update(tags).set(updates).where(eq(tags.id, input.id));
  }

  return getTagById(input.id);
}

/** 删除标签 */
export async function deleteTag(id: string) {
  const existing = await getTagById(id);
  if (!existing) {
    throw new ApiError('TAG_NOT_FOUND', '标签不存在', 404);
  }

  // 检查是否有文章使用此标签
  const relatedPostTags = await db.query.postTags.findMany({
    where: eq(postTags.tagId, id),
    columns: { tagId: true },
  });

  if (relatedPostTags.length > 0) {
    throw new ApiError('TAG_HAS_POSTS', `该标签被 ${relatedPostTags.length} 篇文章使用，请先移除关联`, 400);
  }

  await db.delete(tags).where(eq(tags.id, id));
}
