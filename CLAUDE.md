# pixel-verse Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-02

## Active Technologies
- TypeScript 5.x + Node.js 20 LTS + Astro 5.x (SSR mode), React 18.x (Admin UI), Drizzle ORM (database), Better SQLite3 (embedded DB), Zod (validation), Lucide React (icons), TipTap (rich text editor), Zustand (state management) (004-admin-cms)
- SQLite via Better SQLite3 — 嵌入式数据库，无需额外服务部署，适合中小型博客站点 (004-admin-cms)

- TypeScript 5.x + Node.js 20 LTS + Astro 5.x, React 18.x, MDX v3, Tailwind CSS v4, Framer Motion, Shiki, Sandpack, Pagefind (001-pixelverse-blog)

## Project Structure

```
src/
├── admin/                    # 后台管理面板 React 组件
│   ├── components/           # 通用组件 (Button, Input, Modal, Editor, MediaPicker)
│   ├── pages/                # 页面组件 (Dashboard, Posts, Categories, Tags, Media, Users, Settings)
│   ├── stores/               # Zustand 状态管理
│   └── types/                # TypeScript 类型定义
├── api/                      # API 路由辅助模块
│   └── index.ts              # ok/error/parseBody/getUserId 辅助函数
├── components/               # 前台共享组件
├── layouts/                  # Astro 布局
├── lib/
│   ├── db/                   # 数据库模块 (schema, connection)
│   ├── services/             # 业务逻辑服务 (auth, user, post, category, tag, media, page, audit)
│   └── utils/                # 工具函数 (errors, permissions, slug, env)
├── pages/
│   ├── admin/                # 后台 Astro 页面 (包装 React 组件)
│   ├── api/                  # 公开 API 路由
│   │   ├── admin/            # 管理 API (users, roles, posts, categories, tags, media, pages-cms, audit-log)
│   │   └── posts/            # 公开博客 API
│   ├── blog/ssr/             # 前台博客 SSR 页面
│   └── [...slug].astro       # 动态页面 SSR 端点
├── middleware.ts             # 认证中间件
└── components/MarkdownRenderer.tsx  # Markdown/HTML 渲染组件

scripts/
├── db-migrate.mjs            # 数据库迁移脚本
├── db-seed.mjs               # 种子数据脚本
└── migrate-mdx.mjs           # MDX 内容迁移脚本

data/                         # SQLite 数据库文件 (gitignore)
public/uploads/               # 上传的媒体文件
```

## Commands

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 数据库迁移
node scripts/db-migrate.mjs

# 数据库种子
node scripts/db-seed.mjs

# MDX 内容迁移
node scripts/migrate-mdx.mjs

# 测试
pnpm test
pnpm test:e2e
```

## Code Style

TypeScript 5.x + Node.js 20 LTS: Follow standard conventions. All comments and documentation in Chinese.

## CMS Features

### 角色系统
- **super_admin**: 所有权限，可管理用户、角色、内容
- **editor**: 可创建/编辑/发布/删除文章，管理分类、标签、页面、媒体
- **author**: 可创建/编辑/发布文章，管理媒体

### API 路由结构
- `/api/admin/*` — 管理 API，需要认证和相应权限
- `/api/posts` — 公开博客 API，仅返回已发布文章
- `/api/admin/auth/*` — 认证端点 (login, logout, me)

### 数据库
- 10 个表：roles, users, categories, tags, posts, post_tags, media, pages, audit_log, sessions
- 使用 Drizzle ORM relations 定义表关联
- 外键约束启用 (PRAGMA foreign_keys = ON)

## Recent Changes
- 004-admin-cms: 完成全部 6 个用户故事的实现 (US1-US6)
- 004-admin-cms: 添加数据库迁移/种子脚本、MDX 迁移脚本
- 004-admin-cms: 添加媒体选择器组件并集成到编辑器
- 004-admin-cms: 添加公开页面 SSR 端点

- 001-pixelverse-blog: Added TypeScript 5.x + Node.js 20 LTS + Astro 5.x, React 18.x, MDX v3, Tailwind CSS v4, Framer Motion, Shiki, Sandpack, Pagefind

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
