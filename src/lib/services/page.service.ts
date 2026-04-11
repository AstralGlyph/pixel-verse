/**
 * @fileoverview 页面服务
 * @description 页面 CRUD、发布/下线、列表查询、按别名查询
 * @dependencies drizzle-orm
 */

import { db, pages } from '../db';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';
import { ApiError } from '../utils/errors';

export interface CreatePageInput {
  title: string;
  slug?: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdatePageInput extends Partial<CreatePageInput> {
  id: string;
}

/** 获取页面列表 */
export async function getPages() {
  return db.query.pages.findMany({
    orderBy: [desc(pages.createdAt)],
  });
}

/** 获取页面详情 */
export async function getPageById(id: string) {
  return db.query.pages.findFirst({
    where: eq(pages.id, id),
  });
}

/** 按 slug 获取页面 */
export async function getPageBySlug(slug: string) {
  return db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });
}

/** 创建页面 */
export async function createPage(input: CreatePageInput) {
  const id = randomUUID();
  let slug = input.slug || generateSlug(input.title);

  const existingSlugs = (await db.select({ slug: pages.slug }).from(pages)).map((p) => p.slug);
  slug = ensureUniqueSlug(slug, existingSlugs);

  const now = new Date().toISOString();
  await db.insert(pages).values({
    id,
    title: input.title,
    slug,
    content: input.content,
    status: 'draft',
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    createdAt: now,
    updatedAt: now,
  });

  return getPageById(id);
}

/** 更新页面 */
export async function updatePage(input: UpdatePageInput) {
  const existing = await getPageById(input.id);
  if (!existing) {
    throw new ApiError('PAGE_NOT_FOUND', '页面不存在', 404);
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { updatedAt: now };

  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) updates.content = input.content;
  if (input.seoTitle !== undefined) updates.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) updates.seoDescription = input.seoDescription;

  if (input.slug !== undefined) {
    const existingSlugs = (await db.select({ slug: pages.slug }).from(pages))
      .map((p) => p.slug)
      .filter((s) => s !== existing.slug);
    updates.slug = ensureUniqueSlug(input.slug, existingSlugs);
  }

  await db.update(pages).set(updates).where(eq(pages.id, input.id));
  return getPageById(input.id);
}

/** 发布页面 */
export async function publishPage(id: string) {
  const page = await getPageById(id);
  if (!page) {
    throw new ApiError('PAGE_NOT_FOUND', '页面不存在', 404);
  }

  await db.update(pages).set({ status: 'published', updatedAt: new Date().toISOString() }).where(eq(pages.id, id));
  return getPageById(id);
}

/** 下线页面 */
export async function unpublishPage(id: string) {
  const page = await getPageById(id);
  if (!page) {
    throw new ApiError('PAGE_NOT_FOUND', '页面不存在', 404);
  }

  await db.update(pages).set({ status: 'draft', updatedAt: new Date().toISOString() }).where(eq(pages.id, id));
  return getPageById(id);
}

/** 删除页面 */
export async function deletePage(id: string) {
  const existing = await getPageById(id);
  if (!existing) {
    throw new ApiError('PAGE_NOT_FOUND', '页面不存在', 404);
  }

  await db.delete(pages).where(eq(pages.id, id));
}
