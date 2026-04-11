# 贡献指南

感谢你对 PixelVerse 博客系统感兴趣！本指南将帮助你快速上手项目。

## 项目概述

PixelVerse 是一个内容即体验的个人博客系统，基于 Astro 构建，融合交互式叙事和 AI 增强体验。

## 技术栈

- **框架**: Astro 5.x
- **组件**: React 18.x (Islands Architecture)
- **内容**: MDX v3
- **样式**: Tailwind CSS 3.x
- **动画**: Framer Motion
- **代码高亮**: Shiki
- **代码编辑**: Sandpack
- **搜索**: Pagefind
- **测试**: Vitest (单元) + Playwright (E2E)
- **语言**: TypeScript 5.x (strict mode)

## 开发环境搭建

### 前置条件

- Node.js >= 20 LTS
- pnpm >= 9

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/pixel-verse.git
cd pixel-verse

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (localhost:4321) |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm lint` | 运行代码检查 |
| `pnpm format` | 格式化代码 |

## 创建新文章

使用提供的脚本快速创建文章模板：

```bash
node scripts/create-article.mjs "文章标题" --category "技术" --tags "Astro,React"
```

文章存放在 `src/content/blog/` 目录下，使用 MDX 格式。

### 文章 Frontmatter 格式

```yaml
---
title: "文章标题"
description: "文章描述"
publishedAt: "2026-04-01"
category: "技术"
tags: ["Astro", "React"]
coverImage: "/images/blog/cover.jpg"
draft: false
---
```

## 项目结构

```
pixel-verse/
├── src/
│   ├── components/         # React/Astro 组件
│   │   ├── code/          # 代码相关组件
│   │   ├── interactive/   # 交互式组件
│   │   ├── layout/        # 布局组件
│   │   ├── seo/           # SEO 组件
│   │   ├── social/        # 社交组件
│   │   └── ui/            # UI 基础组件
│   ├── content/           # 内容集合
│   │   ├── blog/          # 博客文章 (MDX)
│   │   └── config.ts      # 内容集合 Schema
│   ├── data/              # 静态数据 (JSON)
│   ├── hooks/             # 自定义 Hooks
│   ├── layouts/           # 页面布局
│   ├── pages/             # 页面路由
│   ├── scripts/           # 客户端脚本
│   ├── styles/            # 全局样式
│   └── utils/             # 工具函数
├── public/                # 静态资源
├── tests/                 # 测试文件
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # E2E 测试
└── specs/                 # 功能规格文档
```

## 代码规范

### 提交规范

我们遵循 Conventional Commits 规范，提交消息格式如下：

```
<type>(<scope>): <description>

[optional body]
```

常用 type：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是 bug 修复）
- `test`: 测试相关
- `chore`: 构建/辅助工具变更

示例：
```
feat(admin): 添加文章批量删除功能
fix(ssr): 修复文章详情页 404 问题
docs(readme): 更新部署指南
```

### Pull Request 指南

创建 PR 时请确保：

- [ ] 代码能通过 `pnpm lint` 检查
- [ ] 相关测试已通过（`pnpm test`、`pnpm test:e2e`）
- [ ] PR 描述清晰，说明变更内容和影响
- [ ] 如有截图需求，请附上前后对比图

### Issue 指南

#### Bug 报告

请包含：
- 问题描述和复现步骤
- 预期行为和实际行为
- 环境信息（Node.js 版本、操作系统、浏览器）
- 相关截图或日志

#### 功能建议

请包含：
- 功能描述和使用场景
- 预期的行为
- 是否有类似实现可以参考

## 许可证

MIT License
