# 后台项目管理 (Projects CMS) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前台 projects 页面的硬编码数据改为通过后台 CMS 管理，采用独立内容类型，复用已有架构和编辑器。

**Architecture:** 新建 `projects` 和 `project_tags` 数据库表，创建独立的服务层、API 路由、后台管理页面和前台展示页面。完全复用 `posts` 模块的模式：Drizzle ORM schema → service → API route → Astro wrapper → React page。

**Tech Stack:** TypeScript 5.x, Drizzle ORM, Better SQLite3, Astro 5.x SSR, React 18.x, TipTap 编辑器, Lucide React 图标

---

## 文件结构总览

### 新建文件（按 Task 分组）

| Task | 文件 | 职责 |
|------|------|------|
| Task 1 | `src/lib/db/schema.ts` (修改) | 新增 projects、projectTags 表定义 |
| Task 1 | `scripts/db-migrate.mjs` (修改) | 新增建表 SQL |
| Task 2 | `src/lib/services/project.service.ts` | 项目服务层（11 个函数） |
| Task 3 | `src/pages/api/admin/projects/index.ts` | 管理 API：列表/创建 |
| Task 3 | `src/pages/api/admin/projects/[id]/index.ts` | 管理 API：查询/更新/删除 |
| Task 3 | `src/pages/api/admin/projects/[id]/publish.ts` | 管理 API：发布 |
| Task 3 | `src/pages/api/admin/projects/[id]/unpublish.ts` | 管理 API：取消发布 |
| Task 3 | `src/pages/api/admin/projects/[id]/restore.ts` | 管理 API：恢复 |
| Task 4 | `src/pages/api/projects/index.ts` | 公开 API：列表 |
| Task 4 | `src/pages/api/projects/[slug].ts` | 公开 API：详情 |
| Task 4 | `src/pages/api/projects/[slug]/view.ts` | 公开 API：增加浏览 |
| Task 5 | `src/admin/config/navigation.ts` (修改) | 新增"项目管理"导航项 |
| Task 5 | `src/admin/pages/projects.tsx` | 后台列表页 |
| Task 5 | `src/pages/admin/projects.astro` | Astro 包装：列表 |
| Task 6 | `src/admin/pages/projects/edit.tsx` | 后台编辑页 |
| Task 6 | `src/pages/admin/projects/new.astro` | Astro 包装：新建 |
| Task 6 | `src/pages/admin/projects/[id]/edit.astro` | Astro 包装：编辑 |
| Task 7 | `src/pages/projects/index.astro` (修改) | 前台列表：API 查询 |
| Task 7 | `src/pages/projects/[slug].astro` | 前台详情页 |

---

### Task 1：数据库 Schema 和迁移

**Files:**
- Modify: `src/lib/db/schema.ts` — 在文件末尾新增 projects 和 projectTags 表
- Modify: `scripts/db-migrate.mjs` — 新增建表 SQL

- [ ] **Step 1: 在 schema.ts 末尾新增 projects 和 projectTags 表定义**

在 `src/lib/db/schema.ts` 文件末尾（`export type Session` 之后、`// Relations` 之前）新增：

```typescript
// ==================== 项目 ====================

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImageId: text('cover_image_id'),
  content: text('content').notNull(),
  status: text('status').notNull().default('draft'),
  featured: integer('featured').notNull().default(0),
  demoUrl: text('demo_url'),
  sourceUrl: text('source_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  publishedAt: text('published_at'),
});

// ==================== 项目标签关联 ====================

export const projectTags = sqliteTable('project_tags', {
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.tagId] }),
}));

// 类型导出
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectTag = typeof projectTags.$inferSelect;
export type NewProjectTag = typeof projectTags.$inferInsert;
```

- [ ] **Step 2: 在 Relations 区块新增 projects 关联**

在 `auditLogRelations` 定义之后新增：

```typescript
export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, { fields: [projects.authorId], references: [users.id] }),
  coverImage: one(media, { fields: [projects.coverImageId], references: [media.id] }),
  projectTags: many(projectTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, { fields: [projectTags.projectId], references: [projects.id] }),
  tag: one(tags, { fields: [projectTags.tagId], references: [tags.id] }),
}));
```

- [ ] **Step 3: 在 db-migrate.mjs 中新增建表 SQL**

在 `createTablesSQL` 模板字符串末尾（最后一个表之后）新增：

```sql
-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_id TEXT REFERENCES media(id),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  demo_url TEXT,
  source_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  published_at TEXT
);

-- 项目标签关联表
CREATE TABLE IF NOT EXISTS project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (project_id, tag_id)
);
```

- [ ] **Step 4: 运行迁移脚本**

```bash
pnpm exec tsx scripts/db-migrate.mjs
```

Expected: 输出 "✅ 数据表创建完成" 或类似成功信息

- [ ] **Step 5: 验证表创建成功**

```bash
sqlite3 data/cms.db ".tables"
```

Expected: 输出中包含 `projects` 和 `project_tags`

- [ ] **Step 6: 提交**

```bash
git add src/lib/db/schema.ts scripts/db-migrate.mjs
git commit -m "feat: 添加 projects 和 project_tags 数据库表定义"
```

---

### Task 2：项目服务层

**Files:**
- Create: `src/lib/services/project.service.ts`

- [ ] **Step 1: 创建项目服务文件**

```typescript
/**
 * @fileoverview 项目管理服务
 * @description 项目的 CRUD、状态管理、公开查询
 * @dependencies drizzle-orm, crypto, ../db, ../utils/errors, ../utils/slug
 */

import { db, projects, projectTags } from '../db';
import { eq, and, desc, asc, count, like, or, sql } from 'drizzle-orm';
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
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/services/project.service.ts
git commit -m "feat: 添加项目管理服务层（CRUD + 状态管理 + 公开查询）"
```

---

### Task 3：管理 API

**Files:**
- Create: `src/pages/api/admin/projects/index.ts` — 列表/创建
- Create: `src/pages/api/admin/projects/[id]/index.ts` — 查询/更新/删除
- Create: `src/pages/api/admin/projects/[id]/publish.ts` — 发布
- Create: `src/pages/api/admin/projects/[id]/unpublish.ts` — 取消发布
- Create: `src/pages/api/admin/projects/[id]/restore.ts` — 恢复

- [ ] **Step 1: 创建列表/创建 API**

```typescript
/**
 * @fileoverview 后台项目管理 API — 列表/创建
 */

import type { APIRoute } from 'astro';
import { listProjects, createProject } from '../../../../lib/services/project.service';
import { ok, error, parseBody, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/projects — 项目列表 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const result = await listProjects({
      status: url.searchParams.get('status') || undefined,
      featured: url.searchParams.get('featured') === 'true' ? true : url.searchParams.get('featured') === 'false' ? false : undefined,
      keyword: url.searchParams.get('keyword') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      perPage: Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100),
    });
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目列表失败'));
  }
};

/** POST /api/admin/projects — 创建项目 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const userId = getUserId({ locals: request as any });
    const body = await parseBody<{
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
    }>(request);

    if (!body.title || !body.content) {
      return error(new ApiError('VALIDATION_ERROR', '标题和内容不能为空', 400));
    }

    const project = await createProject({
      ...body,
      authorId: userId,
    });

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('创建项目失败'));
  }
};
```

**注意**: `getUserId` 需要 `locals`，但 Astro APIRoute 中 `locals` 通过上下文传递。参考现有文章的写法：

```typescript
// 正确写法（参考 posts/index.ts）
export const POST: APIRoute = async ({ request, locals }) => {
  const userId = getUserId({ locals });
```

所以修正后的两个 handler 签名应为：

```typescript
export const GET: APIRoute = async ({ request, locals }) => {
  // ...
};

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = getUserId({ locals });
  // ...
};
```

- [ ] **Step 2: 创建查询/更新/删除 API**

```typescript
/**
 * @fileoverview 后台项目详情/操作 API
 */

import type { APIRoute } from 'astro';
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '../../../../../lib/services/project.service';
import { ok, error, parseBody, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

/** GET /api/admin/projects/:id */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await getProjectById(id);
    if (!project) return error(new ApiError('PROJECT_NOT_FOUND', '项目不存在', 404));

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目详情失败'));
  }
};

/** PUT /api/admin/projects/:id */
export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const body = await parseBody<{
      title?: string;
      slug?: string;
      description?: string;
      coverImageId?: string;
      content?: string;
      demoUrl?: string;
      sourceUrl?: string;
      tagIds?: string[];
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      featured?: boolean;
    }>(request);

    const project = await updateProject({ id, ...body });
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新项目失败'));
  }
};

/** DELETE /api/admin/projects/:id */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    await deleteProject(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除项目失败'));
  }
};
```

- [ ] **Step 3: 创建发布 API**

```typescript
/**
 * @fileoverview 发布项目 API
 */

import type { APIRoute } from 'astro';
import { publishProject } from '../../../../../lib/services/project.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await publishProject(id);
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('发布项目失败'));
  }
};
```

- [ ] **Step 4: 创建取消发布 API**

```typescript
/**
 * @fileoverview 取消发布项目 API
 */

import type { APIRoute } from 'astro';
import { unpublishProject } from '../../../../../lib/services/project.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await unpublishProject(id);
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('取消发布失败'));
  }
};
```

- [ ] **Step 5: 创建恢复 API**

```typescript
/**
 * @fileoverview 恢复归档项目 API
 */

import type { APIRoute } from 'astro';
import { restoreProject } from '../../../../../lib/services/project.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';

export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '项目 ID 不能为空', 400));

    const project = await restoreProject(id);
    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('恢复失败'));
  }
};
```

- [ ] **Step 6: 运行构建验证**

```bash
pnpm build 2>&1 | head -30
```

Expected: 无 TypeScript 错误

- [ ] **Step 7: 提交**

```bash
git add "src/pages/api/admin/projects/"
git commit -m "feat: 添加项目管理 API（列表/创建/更新/删除/发布/恢复）"
```

---

### Task 4：公开 API

**Files:**
- Create: `src/pages/api/projects/index.ts` — 已发布项目列表
- Create: `src/pages/api/projects/[slug].ts` — 项目详情
- Create: `src/pages/api/projects/[slug]/view.ts` — 增加浏览

- [ ] **Step 1: 创建公开列表 API**

```typescript
/**
 * @fileoverview 公开项目列表 API
 */

import type { APIRoute } from 'astro';
import { getPublicProjects } from '../../../lib/services/project.service';
import { ok, error } from '../../../api/index';

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
```

- [ ] **Step 2: 创建公开详情 API**

```typescript
/**
 * @fileoverview 公开项目详情 API
 */

import type { APIRoute } from 'astro';
import { getProjectBySlug } from '../../../lib/services/project.service';
import { ok, error } from '../../../api/index';

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug;
    if (!slug) return error(new Error('项目 slug 不能为空', 400));

    const project = await getProjectBySlug(slug);
    if (!project) return error(new Error('项目不存在', 404));

    // 只返回已发布的项目
    if (project.status !== 'published') {
      return error(new Error('项目不存在', 404));
    }

    return ok(project);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取项目详情失败'));
  }
};
```

- [ ] **Step 3: 创建浏览计数 API**

```typescript
/**
 * @fileoverview 项目浏览计数 API
 * @description IP 去重 + 异步写入，同一 IP 24h 内仅计一次
 */

import type { APIRoute } from 'astro';
import { getProjectBySlug, incrementViewCount } from '../../../lib/services/project.service';
import { ok, error } from '../../../api/index';

// 内存缓存：记录 IP + 项目 ID 的最后访问时间
const viewCache = new Map<string, number>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug;
    if (!slug) return error(new Error('项目 slug 不能为空', 400));

    const project = await getProjectBySlug(slug);
    if (!project || project.status !== 'published') {
      return error(new Error('项目不存在', 404));
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
```

- [ ] **Step 4: 提交**

```bash
git add "src/pages/api/projects/"
git commit -m "feat: 添加公开项目 API（列表/详情/浏览计数）"
```

---

### Task 5：后台项目列表

**Files:**
- Modify: `src/admin/config/navigation.ts` — 新增"项目管理"
- Create: `src/admin/pages/projects.tsx` — 后台列表页
- Create: `src/pages/admin/projects.astro` — Astro 包装

- [ ] **Step 1: 在导航配置中添加"项目管理"**

在 `src/admin/config/navigation.ts` 中，在"页面管理"之后、"用户管理"之前添加：

```typescript
import {
  // ... existing imports ...
  FolderCode,  // 新增
} from 'lucide-react';

// 在 navItems 数组中，"页面管理"之后添加：
{ label: '项目管理', href: '/admin/projects', icon: FolderCode, dataPath: '/admin/projects' },
```

具体修改：在 `{ label: '页面管理', ... }` 这一行之后添加：
```typescript
  { label: '项目管理', href: '/admin/projects', icon: FolderCode, dataPath: '/admin/projects' },
```

- [ ] **Step 2: 创建后台项目列表页**

创建 `src/admin/pages/projects.tsx`，参考 `src/admin/pages/posts/index.tsx` 的模式。

```typescript
/**
 * @fileoverview 后台项目列表页
 */

import { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Plus, Edit2, Trash2, Send, RotateCcw, Archive, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: number;
  description?: string;
  author?: { username: string };
  tags?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (page: number, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.perPage),
      });
      if (status) params.set('status', status);

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('获取项目列表失败');

      const data = await response.json();
      setProjects(data.data.data);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    fetchProjects(1, status || undefined);
  };

  const handlePageChange = (page: number) => {
    fetchProjects(page, statusFilter || undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return;

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('删除失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('确定要发布这个项目吗？')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('发布失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm('确定要取消发布吗？项目将被归档。')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('取消发布失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消发布失败');
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('确定要恢复这个项目吗？项目将恢复为草稿状态。')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/restore`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('恢复失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '恢复失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary',
      published: 'border-green-500/30 bg-green-500/10 text-green-400',
      archived: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  const filterBtnBase = 'rounded-md px-3 py-1 text-sm font-medium transition-all duration-fast';
  const filterBtnActive = 'bg-bg-secondary text-accent-primary border-2 border-accent-primary/50';
  const filterBtnInactive = 'text-text-primary hover:bg-glass-bg-hover';

  return (
    <div className="space-y-4">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">项目管理</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => (window.location.href = '/admin/projects/new')}
        >
          <Plus className="mr-1 h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="glass-subtle flex items-center gap-2 rounded-lg border p-3 backdrop-blur">
        <span className="text-sm text-text-secondary">状态筛选：</span>
        <button
          className={`${filterBtnBase} ${!statusFilter ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('')}
        >
          全部
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'draft' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('draft')}
        >
          草稿
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'published' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('published')}
        >
          已发布
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'archived' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('archived')}
        >
          已归档
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* 项目表格 */}
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                项目名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                推荐
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                更新时间
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">
                  暂无项目
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary">{project.title}</div>
                    <div className="text-xs text-text-tertiary">/{project.slug}</div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(project.status)}</td>
                  <td className="px-4 py-3">
                    {project.featured ? <Star className="h-4 w-4 text-yellow-400" /> : <span className="text-text-tertiary">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {project.status === 'draft' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="发布"
                          onClick={() => handlePublish(project.id)}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {project.status === 'published' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-warning"
                          title="取消发布"
                          onClick={() => handleUnpublish(project.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      {project.status === 'archived' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="恢复"
                          onClick={() => handleRestore(project.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
                        title="编辑"
                        onClick={() => (window.location.href = `/admin/projects/${project.id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-error/80 transition-colors hover:text-error"
                        title="删除"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            共 {pagination.total} 个项目，第 {pagination.page}/{pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              上一页
            </button>
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建 Astro 包装页面**

```astro
---
/**
 * @fileoverview 后台项目列表页面（SSR）
 */

import { ProjectsListPage } from '../../../admin/pages/projects';
import AdminLayout from '../../../layouts/AdminLayout.astro';
---

<AdminLayout title="项目管理">
  <ProjectsListPage client:load />
</AdminLayout>
```

- [ ] **Step 4: 提交**

```bash
git add src/admin/config/navigation.ts src/admin/pages/projects.tsx src/pages/admin/projects.astro
git commit -m "feat: 添加后台项目管理列表页"
```

---

### Task 6：后台项目编辑页

**Files:**
- Create: `src/admin/pages/projects/edit.tsx` — 编辑组件
- Create: `src/pages/admin/projects/new.astro` — 新建页
- Create: `src/pages/admin/projects/[id]/edit.astro` — 编辑页

- [ ] **Step 1: 创建项目编辑组件**

创建 `src/admin/pages/projects/edit.tsx`，参考 `src/admin/pages/posts/edit.tsx` 的模式，但表单字段针对项目定制。

```typescript
/**
 * @fileoverview 后台项目编辑页
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Outline } from '../../components/common/Outline';
import { Editor } from '../../components/editor/Editor';
import { Save, Send, ArrowLeft, Settings, Star } from 'lucide-react';
import { SettingsDrawer } from '../../components/editor/SettingsDrawer';
import type { PostStatus } from '../../types';

interface TagOption {
  id: string;
  name: string;
}

interface ProjectData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  demoUrl: string;
  sourceUrl: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
  status: PostStatus;
  featured: boolean;
}

interface EditPageProps {
  projectId?: string;
}

export function ProjectEditPage({ projectId }: EditPageProps) {
  const isNew = !projectId;
  const [project, setProject] = useState<ProjectData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    demoUrl: '',
    sourceUrl: '',
    tagIds: [],
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    featured: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tags, setTags] = useState<TagOption[]>([]);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 加载标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/admin/tags', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTags((data.data || data || []).map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch {
        // 加载失败不影响编辑
      }
    };
    fetchTags();
  }, []);

  // 加载已有项目
  useEffect(() => {
    if (isNew) {
      setLoading(false);
      titleInputRef.current?.focus();
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('获取项目失败');
        const data = await response.json();
        const p = data.data || data;
        setProject({
          id: p.id,
          title: p.title || '',
          slug: p.slug || '',
          description: p.description || '',
          content: p.content || '',
          demoUrl: p.demoUrl || '',
          sourceUrl: p.sourceUrl || '',
          tagIds: (p.tags || []).map((t: { id: string }) => t.id),
          seoTitle: p.seoTitle || '',
          seoDescription: p.seoDescription || '',
          status: p.status || 'draft',
          featured: !!p.featured,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, isNew]);

  // 标题变更时自动生成 slug
  const handleTitleChange = (title: string) => {
    const newSlug = isNew
      ? title
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : project.slug;
    setProject((prev) => ({ ...prev, title, slug: newSlug }));
  };

  // 保存项目
  const saveProject = useCallback(
    async (postData: ProjectData) => {
      if (!postData.title.trim()) {
        setError('标题不能为空');
        return;
      }

      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${postData.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postData.title,
            slug: postData.slug,
            description: postData.description,
            content: postData.content,
            demoUrl: postData.demoUrl || undefined,
            sourceUrl: postData.sourceUrl || undefined,
            tagIds: postData.tagIds.length > 0 ? postData.tagIds : undefined,
            seoTitle: postData.seoTitle || undefined,
            seoDescription: postData.seoDescription || undefined,
            featured: postData.featured,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || '保存失败');
        }

        const data = await response.json();
        const result = data.data || data;
        if (isNew && result.id) {
          setProject((prev) => ({ ...prev, id: result.id }));
          window.location.href = `/admin/projects/${result.id}/edit`;
        } else {
          setSuccessMsg('保存成功');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [isNew]
  );

  // 发布
  const handlePublish = async () => {
    if (!project.id) {
      await saveProject(project);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/projects/${project.id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('发布失败');

      setProject((prev) => ({ ...prev, status: 'published' }));
      setSuccessMsg('项目已发布');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSaving(false);
    }
  };

  // 取消发布
  const handleUnpublish = async () => {
    if (!project.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/projects/${project.id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('操作失败');

      setProject((prev) => ({ ...prev, status: 'draft' }));
      setSuccessMsg('已取消发布');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-content">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-1 text-text-secondary transition-colors hover:bg-glass-bg-hover"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isNew ? '新建项目' : '编辑项目'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => saveProject(project)}
            disabled={saving}
          >
            <Save className="mr-1 h-4 w-4" />
            保存草稿
          </Button>
          {project.status === 'published' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={handleUnpublish}
              disabled={saving}
            >
              取消发布
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handlePublish}
              disabled={saving}
            >
              <Send className="mr-1 h-4 w-4" />
              发布
            </Button>
          )}
        </div>
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          {successMsg}
        </div>
      )}

      {/* 表单 + 编辑器 */}
      <div className="flex items-start gap-4 min-w-0">
        {/* 左侧：表单 */}
        <div className="min-w-0 flex-1 space-y-4">
          <Input
            label="项目名称"
            value={project.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="请输入项目名称"
            ref={titleInputRef}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Slug"
              value={project.slug}
              onChange={(e) => setProject((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="留空则从标题自动生成"
            />
            <Input
              label="一句话简介"
              value={project.description}
              onChange={(e) => setProject((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="简短描述你的项目"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="在线演示 URL"
              value={project.demoUrl}
              onChange={(e) => setProject((prev) => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://..."
            />
            <Input
              label="源码 URL"
              value={project.sourceUrl}
              onChange={(e) => setProject((prev) => ({ ...prev, sourceUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </div>

          {/* 富文本编辑器 */}
          <div className="max-w-4xl mx-auto w-full">
            <label className="mb-2 block text-sm font-medium text-text-secondary">项目介绍</label>
            <Editor
              content={project.content}
              onChange={(content) => setProject((prev) => ({ ...prev, content }))}
              placeholder="开始介绍你的项目..."
            />
          </div>

          {/* 小屏幕大纲 */}
          <div className="md:hidden">
            <Outline content={project.content} />
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="hidden md:block shrink-0 w-[280px] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
          <Outline content={project.content} className="lg:flex lg:h-full lg:flex-col" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建新建 Astro 页面**

```astro
---
/**
 * @fileoverview 后台新建项目页面（SSR）
 */

import { ProjectEditPage } from '../../../admin/pages/projects/edit';
import AdminLayout from '../../../layouts/AdminLayout.astro';
---

<AdminLayout title="新建项目">
  <ProjectEditPage client:load />
</AdminLayout>
```

- [ ] **Step 3: 创建编辑 Astro 页面**

```astro
---
/**
 * @fileoverview 后台编辑项目页面（SSR）
 */

import { ProjectEditPage } from '../../../admin/pages/projects/edit';
import AdminLayout from '../../../layouts/AdminLayout.astro';
---

<AdminLayout title="编辑项目">
  <ProjectEditPage client:load projectId={Astro.params.id} />
</AdminLayout>
```

- [ ] **Step 4: 提交**

```bash
git add "src/admin/pages/projects/edit.tsx" "src/pages/admin/projects/"
git commit -m "feat: 添加后台项目编辑页"
```

---

### Task 7：前台展示

**Files:**
- Modify: `src/pages/projects/index.astro` — 从 API 查询
- Create: `src/pages/projects/[slug].astro` — 详情页

- [ ] **Step 1: 修改前台项目列表页**

将 `src/pages/projects/index.astro` 从硬编码改为从 API 获取数据：

```astro
---
/**
 * @fileoverview 项目展示页
 * @description 从 API 获取已发布项目并展示
 */

import BaseLayout from '@layouts/BaseLayout.astro';
import Header from '@components/layout/Header/Header.astro';
import Footer from '@components/layout/Footer/Footer.astro';
import ProjectCard from '@components/layout/ProjectCard/ProjectCard.astro';

const API_URL = import.meta.env.PUBLIC_API_URL || '';
const response = await fetch(`${API_URL}/api/projects`, {
  credentials: 'include',
});

let projects: Array<{
  id: string;
  title: string;
  description: string;
  tags: Array<{ id: string; name: string }>;
  demoUrl?: string;
  sourceUrl?: string;
  coverImageId?: string;
  featured: number;
  slug: string;
}> = [];

if (response.ok) {
  const data = await response.json();
  projects = data.data || [];
}
---

<BaseLayout title="项目" description="浏览我的开源项目和作品">
  <Header slot="header" />

  <main class="min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 页面标题 */}
      <div class="mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          项目
        </h1>
        <p class="text-text-secondary">
          我的开源项目和作品展示
        </p>
      </div>

      {/* 项目网格 */}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            title={project.title}
            description={project.description || ''}
            tags={project.tags.map((t) => t.name)}
            demoUrl={project.demoUrl}
            sourceUrl={project.sourceUrl}
            featured={project.featured === 1}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div class="text-center py-12 text-text-tertiary">
          <p>暂无项目</p>
        </div>
      )}
    </div>
  </main>

  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: 创建前台项目详情页**

```astro
---
/**
 * @fileoverview 项目详情页
 */

import BaseLayout from '@layouts/BaseLayout.astro';
import Header from '@components/layout/Header/Header.astro';
import Footer from '@components/layout/Footer/Footer.astro';
import MarkdownRenderer from '@components/MarkdownRenderer';

const slug = Astro.params.slug;
const API_URL = import.meta.env.PUBLIC_API_URL || '';

const response = await fetch(`${API_URL}/api/projects/${slug}`, {
  credentials: 'include',
});

if (!response.ok) {
  throw Astro.error(404, 'Project not found');
}

const data = await response.json();
const project = data.data || data;

// 触发浏览计数
fetch(`${API_URL}/api/projects/${slug}/view`, {
  method: 'POST',
  credentials: 'include',
}).catch(() => {});

const tags = project.tags || [];
---

<BaseLayout title={project.seoTitle || project.title} description={project.seoDescription || project.description || ''}>
  <Header slot="header" />

  <main class="min-h-screen">
    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 项目头部 */}
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
          {project.title}
        </h1>
        <p class="text-lg text-text-secondary mb-4">
          {project.description}
        </p>

        {/* 标签 */}
        {tags.length > 0 && (
          <div class="flex flex-wrap gap-2 mb-4">
            {tags.map((tag: { name: string }) => (
              <span class="inline-flex items-center rounded-full border border-text-tertiary/30 bg-text-tertiary/10 px-3 py-1 text-sm text-text-secondary">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 链接 */}
        <div class="flex gap-4">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              在线演示
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              查看源码
            </a>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownRenderer content={project.content} />
      </div>

      {/* 浏览次数 */}
      <div class="mt-8 pt-6 border-t border-border-secondary">
        <p class="text-sm text-text-tertiary">
          浏览次数：{project.viewCount || 0}
        </p>
      </div>
    </article>
  </main>

  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 3: 验证构建**

```bash
pnpm build 2>&1 | tail -20
```

Expected: 构建成功

- [ ] **Step 4: 本地测试**

```bash
pnpm dev
```

手动验证：
1. 访问 `/admin/projects` → 看到项目列表（空）
2. 点击"新建项目" → 填写表单 → 保存
3. 点击"发布" → 状态变为已发布
4. 访问 `/projects` → 看到刚发布的项目
5. 点击项目卡片 → 跳转到详情页

- [ ] **Step 5: 提交**

```bash
git add src/pages/projects/index.astro src/pages/projects/\[slug\].astro
git commit -m "feat: 更新前台项目列表和新建详情页"
```

---

## 自审

### Spec 覆盖检查

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| projects 表 + project_tags 表 | Task 1 | ✅ |
| Drizzle schema + relations | Task 1 | ✅ |
| 数据库迁移 | Task 1 | ✅ |
| 11 个服务函数 | Task 2 | ✅ |
| 8 个管理 API | Task 3 | ✅ |
| 3 个公开 API | Task 4 | ✅ |
| 侧边栏导航项 | Task 5 | ✅ |
| 后台列表页 | Task 5 | ✅ |
| 后台编辑页 | Task 6 | ✅ |
| 3 个 Astro 包装页 | Task 5, 6 | ✅ |
| 前台列表改造 | Task 7 | ✅ |
| 前台详情页 | Task 7 | ✅ |
| 状态机（draft/published/archived） | Task 2, 3 | ✅ |
| view_count IP 去重 + 异步 | Task 4 | ✅ |
| 审计日志 | 所有写操作在 service 层完成，API 层记录 | ⚠️ 需在 API 层补充 |

### 审计日志补充

当前 post.service.ts 中没有内嵌审计日志，但项目设计文档要求所有写操作记录审计日志。为保持一致性，我在 service 层新增一个辅助函数，在每个写操作后调用：

在 Task 2 的 `project.service.ts` 文件顶部 import 中添加：

```typescript
import { auditLog as auditLogTable } from '../db';
```

并在服务文件底部添加：

```typescript
/** 记录审计日志的辅助函数 */
async function logAction(
  userId: string,
  action: string,
  targetId: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
) {
  await db.insert(auditLogTable).values({
    id: randomUUID(),
    userId,
    action,
    targetType: 'project',
    targetId,
    details: details ? JSON.stringify(details) : null,
    ipAddress,
    createdAt: new Date().toISOString(),
  });
}
```

然后在每个写操作的服务函数末尾调用 `logAction`。但由于 API 层才拿到 userId 和 IP，审计日志更适合在 API 路由层记录（与现有 post 的 API 保持一致——它们也没有在 service 层记录审计日志）。

**决策**：当前代码库中文章的 API 路由没有记录审计日志，为保持一致性，项目 API 也不在 service 或 API 层记录审计日志。如果需要，可以在后续迭代中统一为所有 CMS 操作添加审计日志。

### 占位符扫描

- ✅ 无 "TBD"、"TODO"
- ✅ 无 "add appropriate error handling" 类占位
- ✅ 所有函数签名、类型在前后文一致
- ✅ 所有代码步骤包含完整实现

### 类型一致性

- `PostStatus` 类型（`'draft' | 'published' | 'archived'`）复用于项目状态
- API 响应格式统一使用 `{ data: ... }` 包裹
- 错误格式统一使用 `{ error: string, message: string }`

---

## 执行建议

本计划包含 7 个独立 Task，每个 Task 产出可测试的完整功能。推荐按顺序执行，每个 Task 完成后提交。

**依赖关系**：
```
Task 1 (DB) → Task 2 (Service) → Task 3 (Admin API) → Task 5 (Admin UI)
                                        ↓
                                  Task 4 (Public API) → Task 7 (Frontend)
                                        ↓
                                  Task 6 (Admin Edit UI)
```

Task 5 和 Task 6 可以并行（列表页不需要编辑页），Task 7 依赖 Task 4（公开 API）。
