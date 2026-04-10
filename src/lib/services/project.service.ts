/**
 * @fileoverview 项目管理服务
 * @description 项目的 CRUD、状态管理、公开查询
 * @dependencies drizzle-orm, crypto, ../db, ../utils/errors, ../utils/slug
 */

import { db } from '../db';
import { projects, projectTags } from '../db/schema';
import { eq, and, desc, asc, count, like, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateSlug } from '../utils/slug';
import { ApiError } from '../utils/errors';

// ==================== 类型定义 ====================

export interface CreateProjectInput {
  title: string;
  slug?: string;
  description?: string;
  coverImageId?: string;
  content: string;
  demoUrl?: string;
  sourceUrl?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featured?: boolean;
  authorId: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}

// ==================== 辅助函数 ====================

/** 通过数据库查询确保 slug 唯一性 */
async function ensureUniqueSlug(slug: string, excludeProjectId?: string): Promise<string> {
  const existing = await db
    .select({ id: projects.id, slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, slug));

  if (existing.length === 0 || (excludeProjectId && existing.length === 1 && existing[0].id === excludeProjectId)) {
    return slug;
  }

  let counter = 1;
  let candidate = `${slug}-${counter}`;
  while (true) {
    const found = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, candidate));
    if (found.length === 0 || (excludeProjectId && found.length === 1 && found[0].id === excludeProjectId)) {
      return candidate;
    }
    counter++;
    candidate = `${slug}-${counter}`;
  }
}

/** 获取项目详情（含标签） */
async function getProjectFullById(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      author: { columns: { id: true, username: true } },
      projectTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
  });

  if (!project) return null;

  return {
    ...project,
    tags: project.projectTags.map((pt) => pt.tag),
  };
}

// ==================== 服务函数 ====================

/** 获取项目列表（管理后台用，带分页和筛选） */
export async function listProjects(options: {
  status?: string;
  featured?: boolean;
  keyword?: string;
  page?: number;
  perPage?: number;
}) {
  const { status, featured, keyword, page = 1, perPage = 20 } = options;

  const conditions = [];
  if (status) conditions.push(eq(projects.status, status));
  if (featured !== undefined) conditions.push(eq(projects.featured, featured ? 1 : 0));
  if (keyword) conditions.push(like(projects.title, `%${keyword}%`));

  const countConditions = [...conditions];
  const totalResult = await db
    .select({ count: count() })
    .from(projects)
    .where(countConditions.length > 0 ? and(...countConditions) : undefined);
  const total = totalResult[0]?.count ?? 0;

  const result = await db.query.projects.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      author: { columns: { id: true, username: true } },
      projectTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
    orderBy: [desc(projects.createdAt)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  const items = result.map((p) => ({
    ...p,
    tags: p.projectTags.map((pt) => pt.tag),
  }));

  return {
    data: items,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/** 按 ID 获取项目 */
export async function getProjectById(id: string) {
  return getProjectFullById(id);
}

/** 按 slug 获取项目（前台用） */
export async function getProjectBySlug(slug: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: {
      projectTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
  });

  if (!project) return null;

  return {
    ...project,
    tags: project.projectTags.map((pt) => pt.tag),
  };
}

/** 创建项目 */
export async function createProject(input: CreateProjectInput) {
  const now = new Date().toISOString();
  const id = randomUUID();

  let slug = input.slug || generateSlug(input.title);
  slug = await ensureUniqueSlug(slug, undefined);

  await db.insert(projects).values({
    id,
    title: input.title,
    slug,
    description: input.description,
    coverImageId: input.coverImageId,
    content: input.content,
    status: 'draft',
    demoUrl: input.demoUrl,
    sourceUrl: input.sourceUrl,
    authorId: input.authorId,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoKeywords: input.seoKeywords,
    featured: input.featured ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });

  if (input.tagIds && input.tagIds.length > 0) {
    await db.insert(projectTags).values(input.tagIds.map((tagId) => ({ projectId: id, tagId })));
  }

  return getProjectFullById(id);
}

/** 更新项目 */
export async function updateProject(input: UpdateProjectInput) {
  const existing = await getProjectFullById(input.id);
  if (!existing) {
    throw new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404);
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) {
    updateData.slug = await ensureUniqueSlug(input.slug, input.id);
  }
  if (input.description !== undefined) updateData.description = input.description;
  if (input.coverImageId !== undefined) updateData.coverImageId = input.coverImageId;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.demoUrl !== undefined) updateData.demoUrl = input.demoUrl;
  if (input.sourceUrl !== undefined) updateData.sourceUrl = input.sourceUrl;
  if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) updateData.seoDescription = input.seoDescription;
  if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords;
  if (input.featured !== undefined) updateData.featured = input.featured ? 1 : 0;

  await db.update(projects).set(updateData).where(eq(projects.id, input.id));

  // 更新标签关联
  if (input.tagIds !== undefined) {
    await db.delete(projectTags).where(eq(projectTags.projectId, input.id));
    if (input.tagIds.length > 0) {
      await db.insert(projectTags).values(input.tagIds.map((tagId) => ({ projectId: input.id, tagId })));
    }
  }

  return getProjectFullById(input.id);
}

/** 发布项目 */
export async function publishProject(id: string) {
  const project = await getProjectFullById(id);
  if (!project) {
    throw new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404);
  }

  if (project.status === 'archived') {
    throw new ApiError('INVALID_TRANSITION', '已归档的项目不能发布', 400);
  }

  const now = new Date().toISOString();
  await db.update(projects).set({ status: 'published', publishedAt: now, updatedAt: now }).where(eq(projects.id, id));

  return getProjectFullById(id);
}

/** 取消发布（归档） */
export async function unpublishProject(id: string) {
  const project = await getProjectFullById(id);
  if (!project) {
    throw new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404);
  }

  if (project.status !== 'published') {
    throw new ApiError('INVALID_TRANSITION', '只有已发布的项目才能取消发布', 400);
  }

  await db.update(projects).set({ status: 'archived', updatedAt: new Date().toISOString() }).where(eq(projects.id, id));

  return getProjectFullById(id);
}

/** 恢复归档 */
export async function restoreProject(id: string) {
  const project = await getProjectFullById(id);
  if (!project) {
    throw new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404);
  }

  if (project.status !== 'archived') {
    throw new ApiError('INVALID_TRANSITION', '只有已归档的项目才能恢复', 400);
  }

  await db.update(projects).set({ status: 'draft', updatedAt: new Date().toISOString() }).where(eq(projects.id, id));

  return getProjectFullById(id);
}

/** 删除项目 */
export async function deleteProject(id: string) {
  const existing = await getProjectFullById(id);
  if (!existing) {
    throw new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404);
  }

  await db.delete(projectTags).where(eq(projectTags.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

/** 获取已发布项目列表（前台用） */
export async function getPublicProjects(options?: { featured?: boolean }) {
  const where = and(
    eq(projects.status, 'published'),
    options?.featured ? eq(projects.featured, 1) : undefined,
  );

  const result = await db.query.projects.findMany({
    where,
    with: {
      projectTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
    orderBy: [desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt)],
  });

  return result.map((p) => ({
    ...p,
    tags: p.projectTags.map((pt) => pt.tag),
  }));
}

/** 增加浏览次数 */
export async function incrementViewCount(id: string) {
  await db
    .update(projects)
    .set({ viewCount: sql`${projects.viewCount} + 1` })
    .where(eq(projects.id, id));
}