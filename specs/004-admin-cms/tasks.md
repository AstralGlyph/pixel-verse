# 任务清单：后台内容管理系统 (Admin CMS)

**输入**: 设计文档来自 `/specs/004-admin-cms/`
**前置条件**: plan.md, spec.md, research.md, data-model.md, contracts/

**测试**: 根据项目宪法要求，所有功能必须同时提供单元测试和集成测试。

**组织方式**: 任务按用户故事分组，每个故事可独立实现和测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**: 可并行执行（不同文件，无依赖关系）
- **[Story]**: 所属用户故事（如 US1, US2, US3）
- 描述中必须包含确切文件路径

## 路径约定

- `src/admin/` — 后台管理面板（React 组件和页面）
- `src/api/` — API 路由处理器
- `src/lib/` — 共享库（数据库、服务、工具）
- `src/pages/` — Astro 页面（SSR 模式）
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — 测试目录

---

## 阶段一：环境搭建（共享基础设施）

**目的**: 项目初始化和依赖配置

- [ ] T001 安装新依赖：`@astrojs/node`, `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `bcrypt`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `lucide-react`, `zustand`, `uuid`, `cookie`
- [ ] T002 [P] 更新 `astro.config.mjs` 为 SSR 模式：添加 `@astrojs/node` 适配器，设置 `output: 'server'`
- [ ] T003 [P] 按 plan.md 创建目录结构：`src/admin/`, `src/api/`, `src/lib/db/`, `src/lib/services/`, `src/lib/utils/`, `public/uploads/`
- [ ] T004 [P] 创建 `.env.example`，包含 `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`
- [ ] T005 [P] 更新 `tsconfig.json`，添加新源码目录和路径别名

---

## 阶段二：基础建设（阻塞型前置条件）

**目的**: 核心基础设施，任何用户故事开始前必须完成

**⚠️ 关键**: 此阶段未完成前，不得开始任何用户故事的工作

- [x] T006 在 `src/lib/db/schema.ts` 中定义所有实体的 Drizzle ORM 数据表结构（User, Role, Post, Tag, PostTag, Category, Media, Page, AuditLog, Session）
- [x] T007 在 `src/lib/db/index.ts` 中创建数据库连接模块（Better SQLite3 初始化）
- [x] T008 在 `scripts/db-migrate.mjs` 中创建数据库迁移脚本（初始化所有表和索引）
- [x] T009 [P] 在 `scripts/db-seed.mjs` 中创建种子数据脚本（插入默认角色 super_admin/editor/author 和初始管理员用户）
- [x] T010 在 `src/lib/utils/env.ts` 中实现环境配置模块（使用 Zod 验证所有必需环境变量）
- [x] T011 在 `src/lib/utils/errors.ts` 中实现错误处理工具（标准化 API 错误响应格式、错误类型定义）
- [x] T012 在 `src/lib/utils/slug.ts` 中实现 URL 别名生成工具（从标题自动生成 URL 安全的别名）
- [x] T013 在 `src/lib/services/session.service.ts` 中实现会话管理服务（创建、验证、销毁会话，Cookie 辅助方法）
- [x] T014 在 `src/middleware.ts` 中实现认证中间件（会话验证、HTTP-only Cookie 处理、`/admin/*` 和 `/api/admin/*` 路由保护）
- [x] T015 在 `src/admin/types/index.ts` 中创建共享 TypeScript 类型定义（User, Role, Post, Category, Tag, Media, Page, ApiResponse, PaginationResponse）
- [x] T016 在 `src/api/` 中实现 API 路由基础结构（统一的成功/错误响应包装器）
- [x] T017 在 `src/layouts/AdminLayout.astro` 中创建后台 Astro 布局（侧边栏、头部、响应式外壳）
- [x] T018 在 `src/admin/components/common/` 中创建通用 React UI 组件（Button, Input, Modal, Toast, Card, Table）
- [x] T019 在 `src/admin/stores/auth.store.ts` 中创建 Zustand 状态管理（管理已认证用户状态）

**检查点**: 基础就绪——数据库结构、认证中间件、API 结构、后台布局和 UI 组件均已就位

---

## 阶段三：用户故事 1 — 管理员登录与仪表盘访问 (优先级: P1) 🎯 MVP

**目标**: 管理员可以登录系统、访问受保护的仪表盘、查看内容统计

**独立测试标准**: 使用有效凭据登录成功、访问仪表盘、查看内容数量、无效凭据被拒绝

### 用户故事 1 的测试

- [ ] T020 [P] [US1] 认证服务单元测试（登录、登出、会话验证）在 `tests/unit/services/auth.service.test.ts`
- [ ] T021 [P] [US1] 会话服务单元测试（创建、验证、过期）在 `tests/unit/services/session.service.test.ts`
- [ ] T022 [US1] 登录/登出 API 集成测试在 `tests/integration/api/auth.test.ts`
- [ ] T023 [US1] 仪表盘统计 API 集成测试在 `tests/integration/api/dashboard.test.ts`

### 用户故事 1 的实现

- [x] T024 [US1] 在 `src/lib/services/auth.service.ts` 中实现认证服务（bcrypt 密码哈希、登录验证、用户查询）
- [x] T025 [US1] 在 `src/api/auth.ts` 中实现登录 API `POST /api/admin/auth/login`（验证凭据、创建会话、设置 HTTP-only Cookie）
- [x] T026 [US1] 在 `src/api/auth.ts` 中实现登出 API `POST /api/admin/auth/logout`（使会话失效、清除 Cookie）
- [x] T027 [US1] 在 `src/api/auth.ts` 中实现获取当前用户 API `GET /api/admin/auth/me`（从会话返回用户信息和权限）
- [x] T028 [US1] 在 `src/api/dashboard.ts` 中实现仪表盘统计 API `GET /api/admin/dashboard/stats`（按状态统计文章数量、分类数量、最近操作、媒体数量）
- [x] T029 [US1] 在 `src/admin/pages/login.tsx` 中创建后台登录页面（用户名/密码表单、错误提示、登录成功跳转）
- [x] T030 [US1] 在 `src/admin/pages/dashboard.tsx` 中创建后台仪表盘页面（统计卡片、最近操作列表、侧边栏布局）
- [x] T031 [US1] 在 `src/admin/components/layout/AdminLayout.tsx` 中创建后台布局组件（侧边栏导航、头部用户信息、登出按钮）
- [x] T032 [US1] 在 `src/pages/admin/index.astro` 中创建后台入口 Astro 页面（渲染 React 登录组件，受中间件保护）
- [x] T033 [US1] 在 `src/pages/admin/dashboard.astro` 中创建后台仪表盘 Astro 页面（渲染 React 仪表盘组件，受中间件保护）

**检查点**: 管理员可以登录、查看仪表盘内容统计、所有受认证保护的路由正常工作

---

## 阶段四：用户故事 2 — 博客文章的创建、编辑与发布 (优先级: P1)

**目标**: 管理员可以通过后台界面创建、编辑、保存草稿、发布、预览和删除博客文章

**独立测试标准**: 可以创建文章、保存草稿、编辑、发布、在前台查看——全程无需 Git 操作

### 用户故事 2 的测试

- [ ] T034 [P] [US2] 文章服务单元测试（CRUD、状态转换、别名生成）在 `tests/unit/services/post.service.test.ts`
- [ ] T035 [P] [US2] 别名工具单元测试（自动生成、唯一性、URL 安全性）在 `tests/unit/utils/slug.test.ts`
- [ ] T036 [US2] 文章 CRUD API 集成测试在 `tests/integration/api/posts.test.ts`
- [ ] T037 [US2] 文章发布/取消发布集成测试在 `tests/integration/api/posts-publish.test.ts`

### 用户故事 2 的实现

- [x] T038 [US2] 在 `src/lib/services/post.service.ts` 中实现文章服务（创建、更新、删除、发布、取消发布、归档、分页/筛选列表、按 ID/别名查询）
- [x] T039 [US2] 在 `src/api/posts.ts` 中实现文章列表 API `GET /api/admin/posts`（分页、按状态/分类/标签/作者/日期筛选、排序）
- [x] T040 [US2] 在 `src/api/posts.ts` 中实现文章 CRUD API（按 ID 查询、创建、更新、删除、发布、取消发布）
- [x] T041 [US2] 在 `src/pages/api/posts.ts` 中实现公开博客 API `GET /api/posts` 和 `GET /api/posts/:slug`（SSR 前台渲染使用，仅返回已发布文章）
- [x] T042 [US2] 在 `src/admin/components/editor/Editor.tsx` 中集成 TipTap 编辑器（标题、段落、列表、引用、代码块、图片插入、Markdown 导出）
- [x] T043 [US2] 在 `src/admin/pages/posts/index.tsx` 中创建文章列表页面（表格视图、状态标签、筛选控件、分页、新建/编辑/删除操作）
- [x] T044 [US2] 在 `src/admin/pages/posts/edit.tsx` 中创建文章编辑页面（标题输入、别名输入、TipTap 编辑器、SEO 字段、状态选择器、保存/发布按钮、自动保存）
- [x] T045 [US2] 在 `src/admin/hooks/useAutoSave.ts` 中实现自动保存机制（内容变更防抖保存、本地草稿存储、网络恢复同步）
- [x] T046 [US2] 在 `src/admin/pages/posts/preview.tsx` 中创建文章预览页面（按前台渲染效果展示文章内容）
- [x] T047 [US2] 在 `src/pages/blog/ssr.astro` 中创建 SSR 博客列表页面（数据库驱动、分页）
- [x] T048 [US2] 在 `src/pages/blog/ssr/[slug].astro` 中创建 SSR 博客详情页面（数据库驱动的文章渲染）
- [x] T049 [US2] 在 `src/components/MarkdownRenderer.tsx` 中创建 Markdown 渲染组件（渲染 HTML 内容）

**检查点**: 文章完整生命周期可用——创建、编辑、草稿、发布、预览、前台查看。每篇文章可独立测试。

---

## 阶段五：用户故事 3 — 内容分类与标签管理 (优先级: P2)

**目标**: 管理员可以创建、编辑、删除分类和标签，并将其分配给文章

**独立测试标准**: 可以独立管理分类/标签，并在编辑文章时分配

### 用户故事 3 的测试

- [ ] T050 [P] [US3] 分类服务单元测试在 `tests/unit/services/category.service.test.ts`
- [ ] T051 [P] [US3] 标签服务单元测试在 `tests/unit/services/tag.service.test.ts`
- [ ] T052 [US3] 分类/标签 CRUD API 集成测试在 `tests/integration/api/categories-tags.test.ts`

### 用户故事 3 的实现

- [x] T053 [US3] 在 `src/lib/services/category.service.ts` 中实现分类服务（CRUD、统计每个分类的文章数、安全删除并支持文章重新分配）
- [x] T054 [US3] 在 `src/lib/services/tag.service.ts` 中实现标签服务（CRUD、统计每个标签的文章数、安全删除并确认）
- [x] T055 [US3] 在 `src/pages/api/admin/categories/` 中实现分类 CRUD API（列表查询、按 ID 查询、创建、更新、删除时检查文章数）
- [x] T056 [US3] 在 `src/pages/api/admin/tags/` 中实现标签 CRUD API（列表查询、按 ID 查询、创建、更新、删除时检查文章数）
- [x] T057 [US3] 更新文章 API 端点，在创建/更新时接受和管理 `category_id` 和 `tag_ids` 字段
- [x] T058 [US3] 在 `src/admin/pages/categories.tsx` 中创建分类管理页面（列表、创建、编辑、删除，显示文章数）
- [x] T059 [US3] 在 `src/admin/pages/tags.tsx` 中创建标签管理页面（列表、创建、编辑、删除，显示文章数）
- [x] T060 [US3] 在文章编辑页面 `src/admin/pages/posts/edit.tsx` 中添加分类选择器和标签输入组件（分类下拉框、标签多选）

**检查点**: 分类和标签可完整管理，并可分配给文章

---

## 阶段六：用户故事 4 — 媒体文件管理 (优先级: P2)

**目标**: 管理员可以上传、浏览、搜索和删除媒体文件，并将其插入文章

**独立测试标准**: 可以上传文件到媒体库、浏览文件、插入到文章编辑器

### 用户故事 4 的测试

- [ ] T061 [P] [US4] 媒体服务单元测试（上传验证、文件处理、删除）在 `tests/unit/services/media.service.test.ts`
- [ ] T062 [US4] 媒体上传/删除 API 集成测试在 `tests/integration/api/media.test.ts`

### 用户故事 4 的实现

- [x] T063 [US4] 在 `src/lib/services/media.service.ts` 中实现媒体服务（上传文件到 `public/uploads/`、保存元信息到数据库、分页列表、删除文件和记录、MIME 类型和大小验证）
- [x] T064 [US4] 在 `src/pages/api/admin/media/` 中实现媒体上传 API `POST /api/admin/media`（multipart/form-data 文件上传、10MB 大小限制、MIME 类型验证）
- [x] T065 [US4] 在 `src/pages/api/admin/media/` 中实现媒体列表 API `GET /api/admin/media`（分页列表、按文件名搜索）
- [x] T066 [US4] 在 `src/pages/api/admin/media/` 中实现媒体删除 API `DELETE /api/admin/media/:id`（从磁盘删除文件并从数据库删除记录）
- [x] T067 [US4] 在 `src/admin/pages/media.tsx` 中创建媒体库页面（网格/列表视图、拖拽上传、文件预览、搜索、删除）
- [x] T068 [US4] 在 `src/admin/components/media/MediaPicker.tsx` 中创建媒体选择器组件（模态框选择已有媒体、插入到编辑器）
- [x] T069 [US4] 在 TipTap 编辑器的图片插入按钮中集成媒体选择器 `src/admin/components/editor/Editor.tsx`

**检查点**: 媒体库功能完整——上传、浏览、搜索、删除、插入到文章

---

## 阶段七：用户故事 5 — 页面管理 (优先级: P3)

**目标**: 管理员可以创建、编辑、发布和下线静态页面（关于、联系等）

**独立测试标准**: 可以创建静态页面、发布、在前台访问

### 用户故事 5 的测试

- [ ] T070 [P] [US5] 页面服务单元测试在 `tests/unit/services/page.service.test.ts`
- [ ] T071 [US5] 页面 CRUD API 集成测试在 `tests/integration/api/pages-api.test.ts`

### 用户故事 5 的实现

- [x] T072 [US5] 在 `src/lib/services/page.service.ts` 中实现页面服务（CRUD、发布/下线、列表查询、按别名查询）
- [x] T073 [US5] 在 `src/pages/api/admin/pages-cms/` 中实现页面 CRUD API（列表查询、按 ID 查询、按别名查询、创建、更新、删除、发布）
- [x] T074 [US5] 在 `src/pages/[...slug].astro` 中实现公开页面 SSR 端点（捕获非管理路由、查询数据库获取已发布页面、渲染内容）
- [x] T075 [US5] 在 `src/admin/pages/pages-admin.tsx` 中创建页面管理页面（静态页面列表、状态标签、创建/编辑/删除操作）
- [x] T076 [US5] 在 `src/admin/pages/pages-editor.tsx` 中创建页面编辑器（标题、别名、TipTap 编辑器、SEO 字段、发布开关——复用文章编辑器组件）

**检查点**: 静态页面可通过后台管理，并在前台访问

---

## 阶段八：用户故事 6 — 用户与权限管理 (优先级: P3)

**目标**: 超级管理员可以创建用户、分配角色、管理权限

**独立测试标准**: 可以创建指定角色的新用户，并验证权限边界

### 用户故事 6 的测试

- [ ] T077 [P] [US6] 用户服务单元测试（CRUD、密码修改、角色分配）在 `tests/unit/services/user.service.test.ts`
- [ ] T078 [US6] 用户管理 API 集成测试在 `tests/integration/api/users.test.ts`
- [ ] T079 [US6] 权限执行集成测试在 `tests/integration/api/permissions.test.ts`

### 用户故事 6 的实现

- [x] T080 [US6] 在 `src/lib/services/user.service.ts` 中实现用户服务（CRUD、密码重置、角色分配、用户列表、权限检查）
- [x] T081 [US6] 在 `src/lib/utils/permissions.ts` 中实现权限守卫中间件（在 API 处理器执行前检查用户权限）
- [x] T082 [US6] 在所有后台 API 端点上应用权限守卫（用户管理仅限超级管理员，文章删除限编辑者及以上）
- [x] T083 [US6] 在 `src/pages/api/admin/users/` 中实现用户 CRUD API（列表查询、按 ID 查询、创建、更新角色、重置密码、删除——仅超级管理员）
- [x] T084 [US6] 在 `src/pages/api/admin/roles/` 中实现角色管理 API（列表查询、获取权限——内置角色只读）
- [x] T085 [US6] 在 `src/admin/pages/users.tsx` 中创建用户管理页面（用户列表、创建/编辑/删除、角色分配）
- [x] T086 [US6] 在 `src/admin/pages/settings.tsx` 中创建设置页面（修改自己的密码、更新个人资料、系统信息）
- [x] T087 [US6] 在 `src/lib/services/audit.service.ts` 中添加审计日志服务（记录文章发布/删除、用户创建/删除、页面发布——记录操作人、操作类型、目标对象、详情）
- [x] T088 [US6] 在 `src/admin/pages/audit-log.tsx` 中创建审计日志查看页面（可筛选的最近操作列表）

**检查点**: 多用户支持和基于角色的权限管理功能完整

---

## 阶段九：完善与跨故事关注点

**目的**: 影响多个用户故事的改进项

- [x] T089 [P] 在 `scripts/migrate-mdx.mjs` 中实现 MDX 内容迁移脚本（从 `src/content/` 读取已有 MDX 文件，导入数据库为文章）
- [x] T090 [P] 更新已有博客路由，重定向到新的 SSR 路由 `src/pages/blog/`
- [x] T091 [P] 在所有后台页面中添加响应式设计优化，支持移动端访问
- [x] T092 [P] 在所有 React 页面中添加加载状态、错误边界和空状态
- [ ] T093 在 `tests/e2e/admin-flows/login-publish.spec.ts` 中添加关键用户流程 E2E 测试（登录 → 创建文章 → 发布 → 前台验证）
- [ ] T094 在 `tests/e2e/admin-flows/media-upload.spec.ts` 中添加媒体上传流程 E2E 测试
- [ ] T095 执行 `quickstart.md` 验证——按步骤端到端执行，确认所有命令正常工作
- [x] T096 更新 `CLAUDE.md`，添加 CMS 专属开发指导
- [ ] T097 性能优化：为仪表盘统计和博客列表添加数据库查询缓存
- [ ] T098 安全加固：登录端点添加速率限制，后台表单添加 CSRF 保护
- [ ] T099 运行完整测试套件并修复失败项：`pnpm test && pnpm test:e2e`

---

## 依赖关系与执行顺序

### 阶段依赖关系

- **阶段一（环境搭建）**: 无依赖——可立即开始
- **阶段二（基础建设）**: 依赖阶段一完成——**阻塞所有用户故事**
- **阶段三至八（用户故事）**: 全部依赖阶段二完成后开始
  - 用户故事可按优先级顺序执行（P1 → P2 → P3）
  - 或在团队人力允许时并行执行
- **阶段九（完善）**: 依赖所有目标用户故事完成

### 用户故事依赖关系

- **US1 (P1) 登录与仪表盘**: 基础建设完成后可开始——不依赖其他故事
- **US2 (P1) 文章管理**: 基础建设完成后可开始——仅依赖 US1 的认证上下文（共享中间件）
- **US3 (P2) 分类与标签**: 基础建设完成后可开始——与 US2 集成（文章引用分类/标签）
- **US4 (P2) 媒体库**: 基础建设完成后可开始——与 US2 集成（编辑器图片插入）
- **US5 (P3) 页面管理**: 基础建设完成后可开始——独立于其他故事
- **US6 (P3) 用户与权限管理**: 基础建设完成后可开始——增强 US1 认证为多用户支持

### 每个用户故事内部

- 测试必须先编写并确保失败，再进行实现
- 数据模型在服务之前
- 服务在 API 端点之前
- API 端点在 UI 页面之前
- 核心实现完成后再进行集成
- 一个故事完成后再进入下一个优先级

### 并行机会

- 所有标记 [P] 的环境搭建任务 T002-T005 可并行执行
- 所有标记 [P] 的基础建设任务 T006-T019 可并行执行（在阶段二内）
- 阶段二完成后，所有用户故事可并行开始
- 每个用户故事中标记 [P] 的测试可并行执行
- 故事内标记 [P] 的模型/服务可并行执行

---

## 并行示例：用户故事 1

```bash
# 同时启动 US1 的所有测试：
任务: "认证服务单元测试在 tests/unit/services/auth.service.test.ts"
任务: "会话服务单元测试在 tests/unit/services/session.service.test.ts"
任务: "登录 API 集成测试在 tests/integration/api/auth.test.ts"

# 同时启动 US1 的所有 UI 组件：
任务: "创建登录页面在 src/admin/pages/login.tsx"
任务: "创建仪表盘页面在 src/admin/pages/dashboard.tsx"
任务: "创建后台布局在 src/admin/components/layout/AdminLayout.tsx"
```

---

## 并行示例：用户故事 2

```bash
# 同时启动 US2 的所有测试：
任务: "文章服务单元测试在 tests/unit/services/post.service.test.ts"
任务: "别名工具单元测试在 tests/unit/utils/slug.test.ts"

# 服务就绪后，API 和 UI 并行执行：
任务: "实现文章 CRUD API 在 src/api/posts.ts"
任务: "创建文章列表页面在 src/admin/pages/posts/index.tsx"
任务: "创建文章编辑页面在 src/admin/pages/posts/edit.tsx"
```

---

## 实施策略

### MVP 优先（仅用户故事 1）

1. 完成阶段一：环境搭建
2. 完成阶段二：基础建设（关键——阻塞所有故事）
3. 完成阶段三：用户故事 1
4. **停止并验证**: 测试登录、仪表盘访问、认证保护
5. 如就绪则部署/演示

### 增量交付

1. 环境搭建 + 基础建设 → 基础就绪
2. 添加 US1（登录与仪表盘）→ 独立测试 → 部署/演示（MVP！）
3. 添加 US2（文章管理）→ 独立测试 → 部署/演示
4. 添加 US3（分类与标签）→ 独立测试 → 部署/演示
5. 添加 US4（媒体库）→ 独立测试 → 部署/演示
6. 添加 US5（页面管理）→ 独立测试 → 部署/演示
7. 添加 US6（用户管理）→ 独立测试 → 部署/演示
8. 每个故事增加价值且不破坏已有故事

### 多开发者并行策略

多人协作时：

1. 团队共同完成环境搭建 + 基础建设
2. 基础建设完成后：
   - 开发者 A: US1（登录与仪表盘）+ US6（用户管理）
   - 开发者 B: US2（文章管理）+ US3（分类与标签）
   - 开发者 C: US4（媒体库）+ US5（页面管理）
3. 各故事独立完成并集成

---

## 备注

- [P] 任务 = 不同文件，无依赖关系
- [Story] 标签将任务映射到具体用户故事，便于追溯
- 每个用户故事可独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交代码
- 可在任何检查点停止以独立验证故事
- **总任务数**: **99**
- **各故事任务数**: US1=14, US2=16, US3=8, US4=7, US5=5, US6=9, 环境搭建=5, 基础建设=14, 完善=11
