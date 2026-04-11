# Quick Start: PixelVerse 个人博客系统

**Feature**: 001-pixelverse-blog  
**Date**: 2026-03-31

---

## 环境要求

- **Node.js**: 20 LTS 或更高版本
- **包管理器**: pnpm 8.x（推荐）或 npm
- **编辑器**: VS Code（推荐安装 Astro 插件）

---

## 项目初始化

### 1. 创建 Astro 项目

```bash
# 使用 pnpm
pnpm create astro@latest pixelverse-blog

# 选择配置：
# - Template: Minimal
# - TypeScript: Strict
# - Install dependencies: Yes
# - Git: Yes
```

### 2. 安装核心依赖

```bash
cd pixelverse-blog

# Astro 集成
pnpm add @astrojs/mdx @astrojs/react @astrojs/tailwind @astrojs/sitemap

# React 相关
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom

# 样式
pnpm add tailwindcss @tailwindcss/typography

# 代码高亮和游乐场
pnpm add shiki @codesandbox/sandpack-react

# 动画
pnpm add framer-motion

# 搜索
pnpm add @pagefind/astro

# 工具
pnpm add date-fns reading-time gray-matter
```

### 3. 配置 Astro

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import pagefind from '@pagefind/astro';

export default defineConfig({
  site: 'https://your-domain.com',
  integrations: [
    mdx(),
    react(),
    tailwind(),
    sitemap(),
    pagefind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
```

### 4. 配置 TypeScript

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

---

## 目录结构创建

```bash
# 创建核心目录
mkdir -p src/{components/{ui,code,layout,interactive,social},layouts,pages/{blog,projects,about,tags,uses,privacy},content/{blog,projects},data,styles,utils,hooks,integrations}

# 创建测试目录
mkdir -p tests/{unit,integration,e2e}

# 创建静态资源目录
mkdir -p public/{fonts,images/{og,blog}}
```

---

## 基础配置文件

### Tailwind CSS 配置

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量
        bg: 'var(--color-bg-primary)',
        text: 'var(--color-text-primary)',
        accent: 'var(--color-accent-primary)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--color-text-primary)',
            a: {
              color: 'var(--color-accent-primary)',
              '&:hover': {
                color: 'var(--color-accent-secondary)',
              },
            },
            code: {
              color: 'var(--color-accent-primary)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

### 内容集合配置

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(50).max(200),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1).max(10),
    category: z.string().min(1),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    cover: z.object({
      src: z.string(),
      alt: z.string().min(1),
    }).optional(),
    toc: z.boolean().default(true),
    readingTime: z.union([z.number(), z.literal('auto')]).default('auto'),
  }),
});

export const collections = { blog };
```

---

## 开发工作流

### 本地开发

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:4321
```

### 创建新文章

```bash
# 创建新文章文件
touch src/content/blog/my-first-post.mdx
```

```mdx
---
title: "我的第一篇文章"
description: "这是一篇示例文章，展示 MDX 格式和 Frontmatter 配置"
publishedAt: 2026-03-31
tags: ["技术", "博客"]
category: "技术"
---

import { Callout } from '@components/ui/Callout';
import { CodePlayground } from '@components/code/CodePlayground';

# 我的第一篇文章

<Callout type="info">
  这是一个信息提示框
</Callout>

## 代码示例

<CodePlayground
  template="react"
  code={`function Hello() {
  return <h1>Hello, World!</h1>;
}`}
/>
```

### 构建和预览

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

---

## 测试设置

### 单元测试配置

```typescript
// vitest.config.ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### E2E 测试配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
});
```

---

## 部署配置

### Cloudflare Pages

```bash
# 安装 Wrangler CLI
pnpm add -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy ./dist
```

### Vercel

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel
```

---

## 常用脚本

```json
// package.json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx,.astro",
    "format": "prettier --write \"src/**/*.{ts,tsx,astro,mdx}\""
  }
}
```

---

## 下一步

1. 创建首页布局 (`src/layouts/BaseLayout.astro`)
2. 实现核心 UI 组件（Callout、Tabs、CodePlayground）
3. 配置主题系统和 CSS 变量
4. 设置 Giscus 评论系统
5. 实现 Command Palette 搜索
6. 编写单元测试和 E2E 测试

详细的任务列表将在 `/speckit.tasks` 命令执行后生成。