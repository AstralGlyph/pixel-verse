# Implementation Plan: 后台内容管理系统 (Admin CMS)

**Branch**: `004-admin-cms` | **Date**: 2026-04-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-admin-cms/spec.md`

## Summary

构建一个基于 Web 的后台内容管理系统 (CMS)，使内容编辑者能够在不接触 Git 或命令行的情况下，通过可视化界面管理博客文章、分类、标签、媒体文件和静态页面。系统需要与现有 Astro 博客站点集成，内容存储于数据库而非 MDX 文件，前台通过 API 动态渲染或增量构建实现实时更新。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20 LTS  
**Primary Dependencies**: Astro 5.x (SSR mode), React 18.x (Admin UI), Drizzle ORM (database), Better SQLite3 (embedded DB), Zod (validation), Lucide React (icons)  
**Storage**: SQLite via Better SQLite3 — 嵌入式数据库，无需额外服务部署，适合中小型博客站点  
**Testing**: Vitest (unit), Playwright (E2E)  
**Target Platform**: Linux/macOS 服务器，Node.js 运行时  
**Project Type**: Web application (Admin SPA + SSR frontend)  
**Performance Goals**: 文章发布后 30 秒内前台可见；管理后台页面加载 < 2 秒；支持 1000+ 篇文章  
**Constraints**: 保持 Astro 生态兼容性；后台界面响应式；数据库文件需定期备份  
**Scale/Scope**: 单实例部署，支持 1-5 个并发编辑用户，1000+ 篇文章管理

### Key Technical Decisions (NEEDS CLARIFICATION resolved)

1. **前台更新机制**: 采用 SSR (Server-Side Rendering) 模式 — Astro 从静态站点切换为 SSR，内容从数据库实时读取。理由：满足 FR-016 实时发布需求，同时保持 Astro 生态一致性
2. **数据库选择**: SQLite — 嵌入式、零配置、适合博客规模。后续可通过 Drizzle ORM 迁移到 PostgreSQL 等外部数据库
3. **富文本编辑器**: 采用 TipTap 或 MDX 编辑器 — 支持 Markdown 语法，与现有 Astro MDX 渲染管线兼容
4. **认证方案**: Session-based 认证 (基于 Astro middleware) — 简单可靠，适合后台管理系统
5. **媒体存储**: 本地文件系统 (`public/uploads/`) + 数据库元信息记录

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Architecture Excellence
- [x] 采用领域驱动设计：models (数据层) → services (业务逻辑) → api (接口层) 分层架构
- [x] 模块职责清晰：admin 后台与 frontend 前台独立模块
- [x] 插件化架构：CMS 功能作为 Astro 集成模块添加，不影响现有前台

### Code Quality
- [x] 所有公共 API 使用 JSDoc 注释
- [x] 代码遵循 TypeScript 严格模式
- [x] 文件头注释模板已定义

### Test-Driven Development
- [x] 所有功能提供单元测试 (Vitest) 和集成测试
- [x] 核心模块测试覆盖率 ≥ 80%
- [x] E2E 测试覆盖关键用户流程 (Playwright)

### Maintainability
- [x] 函数单一职责，单文件 ≤ 500 行
- [x] 技术债务通过 Issues 跟踪
- [x] 依赖库定期更新

### Zero Technical Debt
- [x] CI 门禁：lint + test 全部通过
- [x] 代码审查 ≥ 1 人 Approve
- [x] 无未解决的冲突

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-cms/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── admin/                    # Admin CMS panel (React SPA)
│   ├── components/           # Reusable UI components
│   │   ├── editor/           # Rich text editor components
│   │   ├── media/            # Media library components
│   │   ├── layout/           # Admin layout (sidebar, header)
│   │   └── common/           # Shared UI elements (buttons, forms, modals)
│   ├── pages/                # Admin pages
│   │   ├── login.tsx         # Login page
│   │   ├── dashboard.tsx     # Dashboard overview
│   │   ├── posts/            # Post management (list, edit, create)
│   │   ├── categories.tsx    # Category management
│   │   ├── tags.tsx          # Tag management
│   │   ├── media.tsx         # Media library
│   │   ├── pages.tsx         # Static page management
│   │   └── settings.tsx      # System settings
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # State management (Zustand or Context)
│   ├── utils/                # Admin-specific utilities
│   └── types/                # TypeScript type definitions
│
├── api/                      # API routes (RESTful endpoints)
│   ├── auth.ts               # Authentication endpoints
│   ├── posts.ts              # Post CRUD endpoints
│   ├── categories.ts         # Category CRUD endpoints
│   ├── tags.ts               # Tag CRUD endpoints
│   ├── media.ts              # Media upload/management endpoints
│   ├── pages.ts              # Static page CRUD endpoints
│   └── dashboard.ts          # Dashboard statistics endpoint
│
├── lib/                      # Shared libraries
│   ├── db/                   # Database layer
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   ├── index.ts          # Database connection
│   │   └── migrations/       # Database migration files
│   ├── services/             # Business logic services
│   │   ├── post.service.ts   # Post business logic
│   │   ├── auth.service.ts   # Authentication logic
│   │   ├── media.service.ts  # Media handling logic
│   │   └── slug.service.ts   # URL slug generation
│   └── utils/                # Shared utilities
│
├── content/                  # Existing MDX content (preserved for migration)
├── pages/                    # Astro frontend pages (SSR mode)
│   ├── blog/                 # Blog listing and detail pages (DB-backed)
│   ├── [...page].astro       # Dynamic page router
│   └── api/                  # Public API endpoints (if needed)
│
├── layouts/                  # Astro layouts
├── components/               # Shared Astro components
├── middleware.ts             # Astro middleware (auth guard, session)
└── env.d.ts                  # Environment type definitions

public/
├── uploads/                  # Uploaded media files storage
└── admin/                    # Admin static assets (if any)

tests/
├── unit/
│   ├── services/             # Service unit tests
│   └── utils/                # Utility unit tests
├── integration/
│   ├── api/                  # API integration tests
│   └── database/             # Database integration tests
└── e2e/
    └── admin-flows/          # Admin user flow E2E tests
```

**Structure Decision**: Web application with Admin SPA + SSR frontend. The admin panel is built as a React application served within Astro, while the frontend blog pages switch from static MDX rendering to SSR with database-backed content. This preserves the existing Astro ecosystem while enabling real-time content updates.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Astro SSR mode (vs static) | FR-016 requires real-time content updates without rebuild | Static rebuild on publish would introduce 10-30s delay, violating SC-003 |
| Database layer (vs file-based) | Spec explicitly requires non-Git content management | MDX files would still require Git workflow |
| React SPA for admin | Rich editing experience with real-time preview | Server-rendered admin pages would feel sluggish for content editing |
