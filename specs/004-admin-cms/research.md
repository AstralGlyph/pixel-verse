# Research: 后台内容管理系统 (Admin CMS)

**Date**: 2026-04-01  
**Feature**: 004-admin-cms

## Decision 1: 前台网站更新机制

**Decision**: Astro SSR (Server-Side Rendering) 模式 — 前台从静态构建切换为 SSR，内容从数据库实时读取

**Rationale**:
- 规范 FR-016 要求内容发布后实时更新，无需手动构建或部署
- 静态站点 (SSG) 每次内容变更需要重新构建，违背"非 Git 管理"的核心诉求
- SSR 模式下，每次请求从数据库读取最新内容，发布即生效
- Astro 原生支持 SSR 模式，切换成本可控
- 现有 Astro 组件和布局可复用，仅数据源从 MDX 文件切换为数据库查询

**Alternatives considered**:
- **增量构建 (ISR)**: Astro 支持部分框架的 ISR，但生态支持有限，且仍有构建延迟
- **混合模式 (SSG + API)**: 部分页面静态生成，部分动态渲染。增加架构复杂度，维护成本高
- **Webhook 触发构建**: 发布后触发 CI/CD 重新构建。延迟 10-30 秒，不满足 SC-003 的 30 秒内可见要求

## Decision 2: 数据库选型

**Decision**: SQLite via Better SQLite3 + Drizzle ORM

**Rationale**:
- 博客站点规模适中 (1000+ 篇文章)，SQLite 完全胜任
- 嵌入式数据库，无需额外服务部署和运维
- Drizzle ORM 提供类型安全的查询构建器，与 TypeScript 深度集成
- 后续如需迁移到 PostgreSQL/MySQL，Drizzle ORM 支持多数据库后端

**Alternatives considered**:
- **PostgreSQL**: 功能强大但需要独立服务部署，对博客规模过度设计
- **MongoDB**: 文档数据库适合内容管理，但增加运维复杂度
- **JSON 文件存储**: 实现简单但并发写入有冲突风险，不适合多用户场景

## Decision 3: 富文本编辑器

**Decision**: TipTap (基于 ProseMirror) + Markdown 导出

**Rationale**:
- TipTap 提供无头 (headless) 编辑器，可完全自定义 UI
- 支持 Markdown 快捷键和导出，与 Astro MDX 渲染管线兼容
- 内置常用扩展 (标题、列表、代码块、图片、表格等)
- React 集成良好，TypeScript 类型完整
- 社区活跃，文档完善

**Alternatives considered**:
- **MDX Editor**: 直接编辑 MDX，与现有 Astro 内容格式一致。但学习曲线较陡
- **Tiptap**: 富文本 + Markdown 导出，用户体验更好
- **Sandpack (已有依赖)**: 适合代码预览，不适合作为内容编辑器

## Decision 4: 认证方案

**Decision**: Session-based 认证 (基于 Astro Middleware + HTTP-only Cookie)

**Rationale**:
- HTTP-only Cookie 防止 XSS 攻击，安全性优于 localStorage token
- Session 存储在数据库，支持服务端验证和强制下线
- Astro middleware 可在请求级别拦截未认证访问
- 实现简单，无需引入第三方认证服务

**Alternatives considered**:
- **JWT Token**: 无状态但 token 泄露后无法撤销，不适合后台管理
- **OAuth2/SSO**: 适合企业场景，对个人博客过度设计
- **Basic Auth**: 实现最简单但安全性不足

## Decision 5: Astro 配置调整

**Decision**: 将 Astro 配置从 SSG 切换为 SSR (output: 'server')，适配器选择 Node.js

**Rationale**:
- 现有 `astro.config.mjs` 未指定 output 模式，默认为 SSG (静态)
- SSR 模式需要设置 `output: 'server'` 和 Node.js 适配器 (`@astrojs/node`)
- 现有 MDX 内容可通过迁移脚本导入数据库，保持兼容

**Required changes**:
- 添加 `@astrojs/node` 适配器
- 设置 `output: 'server'` 和 `adapter: node()`
- 配置 middleware 处理认证和 session
- 保留部分静态页面 (如首页) 的 SSG 能力通过 `prerender` 配置
