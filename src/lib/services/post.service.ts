/**
 * @fileoverview 文章服务
 * @description 文章 CRUD、状态转换、分页筛选、按 slug 查询
 * @dependencies drizzle-orm
 */

import { db, posts, postTags } from '../db';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateSlug } from '../utils/slug';
import { ApiError } from '../utils/errors';

export interface CreatePostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImageId?: string;
  status?: 'draft' | 'published' | 'archived';
  authorId: string;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

/** 通过数据库查询确保 slug 唯一性 */
async function ensureUniqueSlugFromDb(slug: string, excludePostId?: string): Promise<string> {
  const existing = await db
    .select({ id: posts.id, slug: posts.slug })
    .from(posts)
    .where(eq(posts.slug, slug));

  if (existing.length === 0 || (excludePostId && existing.length === 1 && existing[0].id === excludePostId)) {
    return slug;
  }

  let counter = 1;
  let candidate = `${slug}-${counter}`;
  while (true) {
    const found = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate));
    if (found.length === 0 || (excludePostId && found.length === 1 && found[0].id === excludePostId)) {
      return candidate;
    }
    counter++;
    candidate = `${slug}-${counter}`;
  }
}

/** 获取文章列表（带分页和筛选） */
export async function getPosts(options: {
  status?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const {
    status,
    categoryId,
    tagId,
    authorId,
    dateFrom,
    dateTo,
    page = 1,
    perPage = 20,
    sort = 'createdAt',
    order = 'desc',
  } = options;

  const sortField = sort === 'title' ? posts.title : sort === 'publishedAt' ? posts.publishedAt : posts.createdAt;
  const orderFn = order === 'asc' ? asc : desc;

  // 构建 where 条件
  const conditions = [];
  if (status) conditions.push(eq(posts.status, status));
  if (categoryId) conditions.push(eq(posts.categoryId, categoryId));
  if (authorId) conditions.push(eq(posts.authorId, authorId));

  // 获取总数（使用 COUNT 查询，避免加载全部数据到内存）
  const countConditions = [...conditions];
  const totalResult = await db.select({ count: count() }).from(posts).where(countConditions.length > 0 ? and(...countConditions) : undefined);
  const total = totalResult[0]?.count ?? 0;

  // 获取文章列表（带关联）
  const result = await db.query.posts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      author: { columns: { id: true, username: true } },
      category: { columns: { id: true, name: true } },
    },
    orderBy: [orderFn(sortField)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  // 为每篇文章获取标签（批量查询，避免 N+1）
  const postIds = result.map((p) => p.id);
  const allPostTags = postIds.length > 0
    ? await db.query.postTags.findMany({
        where: (pt, { inArray }) => inArray(pt.postId, postIds),
        with: { tag: { columns: { id: true, name: true } } },
      })
    : [];
  const tagsByPostId = new Map<string, Array<{ id: string; name: string }>>();
  for (const pt of allPostTags) {
    if (!tagsByPostId.has(pt.postId)) tagsByPostId.set(pt.postId, []);
    tagsByPostId.get(pt.postId)!.push(pt.tag);
  }

  const postsWithTags = result.map((post) => ({
    ...post,
    tags: tagsByPostId.get(post.id) || [],
  }));

  return {
    data: postsWithTags,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/** 获取文章详情 */
export async function getPostById(id: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: { columns: { id: true, username: true } },
      category: { columns: { id: true, name: true } },
    },
  });

  if (!post) return null;

  const pt = await db.query.postTags.findMany({
    where: eq(postTags.postId, post.id),
    with: { tag: { columns: { id: true, name: true } } },
  });

  return { ...post, tags: pt.map((t) => t.tag) };
}

/** 按 slug 获取文章 */
export async function getPostBySlug(slug: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: { columns: { id: true, username: true } },
      category: { columns: { id: true, name: true, slug: true } },
    },
  });

  if (!post) return null;

  const pt = await db.query.postTags.findMany({
    where: eq(postTags.postId, post.id),
    with: { tag: { columns: { id: true, name: true, slug: true } } },
  });

  return { ...post, tags: pt.map((t) => t.tag) };
}

/** 创建文章 */
export async function createPost(input: CreatePostInput) {
  const now = new Date().toISOString();
  const id = randomUUID();

  // 处理 slug：通过数据库查询确保唯一性
  let slug = input.slug || generateSlug(input.title);
  slug = await ensureUniqueSlugFromDb(slug, undefined);

  await db.insert(posts).values({
    id,
    title: input.title,
    slug,
    content: input.content,
    excerpt: input.excerpt,
    coverImageId: input.coverImageId,
    status: input.status || 'draft',
    authorId: input.authorId,
    categoryId: input.categoryId,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoKeywords: input.seoKeywords,
    createdAt: now,
    updatedAt: now,
  });

  // 关联标签
  if (input.tagIds && input.tagIds.length > 0) {
    await db.insert(postTags).values(input.tagIds.map((tagId) => ({ postId: id, tagId })));
  }

  return getPostById(id);
}

/** 更新文章 */
export async function updatePost(input: UpdatePostInput) {
  const existing = await getPostById(input.id);
  if (!existing) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { updatedAt: now };

  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) updates.content = input.content;
  if (input.excerpt !== undefined) updates.excerpt = input.excerpt;
  if (input.coverImageId !== undefined) updates.coverImageId = input.coverImageId;
  if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
  if (input.seoTitle !== undefined) updates.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) updates.seoDescription = input.seoDescription;
  if (input.seoKeywords !== undefined) updates.seoKeywords = input.seoKeywords;

  // 处理 slug
  if (input.slug !== undefined) {
    updates.slug = await ensureUniqueSlugFromDb(input.slug, input.id);
  }

  // 状态转为 published 时设置 publishedAt
  if (input.status === 'published' && existing.status !== 'published') {
    updates.publishedAt = now;
  }

  await db.update(posts).set(updates).where(eq(posts.id, input.id));

  // 更新标签关联
  if (input.tagIds !== undefined) {
    await db.delete(postTags).where(eq(postTags.postId, input.id));
    if (input.tagIds.length > 0) {
      await db.insert(postTags).values(input.tagIds.map((tagId) => ({ postId: input.id, tagId })));
    }
  }

  return getPostById(input.id);
}

/** 发布文章 */
export async function publishPost(id: string) {
  const post = await getPostById(id);
  if (!post) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  if (post.status === 'archived') {
    throw new ApiError('INVALID_TRANSITION', '已归档的文章不能发布', 400);
  }

  const now = new Date().toISOString();
  await db.update(posts).set({ status: 'published', publishedAt: now, updatedAt: now }).where(eq(posts.id, id));

  return getPostById(id);
}

/** 取消发布 */
export async function unpublishPost(id: string) {
  const post = await getPostById(id);
  if (!post) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  await db.update(posts).set({ status: 'archived', updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
  return getPostById(id);
}

/** 归档文章 */
export async function archivePost(id: string) {
  const post = await getPostById(id);
  if (!post) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  await db.update(posts).set({ status: 'archived', updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
  return getPostById(id);
}

/** 恢复归档文章（archived → draft） */
export async function unarchivePost(id: string) {
  const post = await getPostById(id);
  if (!post) {
    throw new ApiError("POST_NOT_FOUND", "文章不存在", 404);
  }

  if (post.status !== "archived") {
    throw new ApiError("INVALID_TRANSITION", "只有归档的文章才能恢复", 400);
  }

  await db.update(posts).set({ status: "draft", updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
  return getPostById(id);
}
/** 删除文章 */
export async function deletePost(id: string) {
  const existing = await getPostById(id);
  if (!existing) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  // 删除标签关联
  await db.delete(postTags).where(eq(postTags.postId, id));
  // 删除文章
  await db.delete(posts).where(eq(posts.id, id));
}

/** 获取已发布文章列表（前台 SSR 使用） */
export async function getPublishedPosts(page = 1, perPage = 10) {
  const result = await db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    with: {
      author: { columns: { id: true, username: true } },
      category: { columns: { id: true, name: true, slug: true } },
    },
    orderBy: [desc(posts.publishedAt)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  const total = (await db.select({ id: posts.id }).from(posts).where(eq(posts.status, 'published'))).length;

  const postsWithTags = await Promise.all(
    result.map(async (post) => {
      const pt = await db.query.postTags.findMany({
        where: eq(postTags.postId, post.id),
        with: { tag: { columns: { id: true, name: true, slug: true } } },
      });
      return { ...post, tags: pt.map((t) => t.tag) };
    })
  );

  return {
    data: postsWithTags,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  };
}
