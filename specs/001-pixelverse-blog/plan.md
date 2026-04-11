# Implementation Plan: PixelVerse 个人博客系统

**Branch**: `001-pixelverse-blog` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pixelverse-blog/spec.md`

## Summary

打造一个**内容即体验**的个人博客系统，核心价值主张是"每篇文章都是一次独立的体验"。采用 Astro + React Islands 架构实现默认零 JS 输出、需要交互时按需加载 React 组件的 Islands Architecture，配合 MDX v3 支持在 Markdown 中嵌入交互式 React 组件。目标性能指标：LCP < 1.5s、Lighthouse Performance > 95、首页 JS Bundle < 50KB (gzipped)。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20 LTS  
**Primary Dependencies**: Astro 5.x, React 18.x, MDX v3, Tailwind CSS v4, Framer Motion, Shiki, Sandpack, Pagefind  
**Storage**: 文件系统（MDX 文件）+ Edge KV（阅读量统计，Cloudflare KV / Vercel KV）  
**Testing**: Vitest（单元测试）+ Playwright（E2E 测试）+ Testing Library（组件测试）  
**Target Platform**: Web（现代浏览器：Chrome/Firefox/Safari/Edge 最新 2 版本，iOS Safari 16+，Android Chrome 最新版）
**Project Type**: web-application（静态站点生成 SSG + Islands Architecture）
**Performance Goals**: LCP < 1.5s, CLS < 0.05, INP < 200ms, Lighthouse Performance > 95, TTFB < 100ms (Edge)
**Constraints**: 首页 JS Bundle < 50KB (gzipped), 核心阅读体验不依赖 JS, WCAG 2.2 AA 级合规
**Scale/Scope**: 初期 10-50 篇文章，每月新增 2-5 篇，支持 1000 并发用户无性能降级

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

根据项目宪法 (CLAUDE.md) 进行检查：

| 原则 | 状态 | 说明 |
|------|------|------|
| **I. 架构卓越** | ✅ 通过 | 采用 Islands Architecture，遵循 SOLID 原则，模块化设计 |
| **II. 代码质量与注释** | ✅ 通过 | 使用 JSDoc 注释规范，中文注释要求 |
| **III. 业务操作日志记录** | ⚠️ 部分 | 静态博客无后端日志，阅读量统计需结构化记录 |
| **IV. 可扩展性优先** | ✅ 通过 | 插件化组件系统（MDX 组件），配置与代码分离 |
| **V. 可维护性与可持续性** | ✅ 通过 | 代码复杂度控制，依赖管理策略 |
| **VI. 持续迭代与技术先进性** | ✅ 通过 | 采用前沿技术栈（Astro 5, Tailwind v4），技术选型有明确评估 |
| **VII. 零技术债务容忍** | ✅ 通过 | 静态分析、单元测试、集成测试覆盖要求 |
| **VIII. 需求明确性优先** | ✅ 通过 | 规格文档已完成，验收标准明确 |
| **IX. 测试驱动开发** | ✅ 通过 | 单元测试 + 集成测试要求，覆盖率 ≥ 80% |
| **X. 开发流程规范** | ✅ 通过 | 遵循设计→编码→测试三阶段流程 |
| **XI. 工作流程自动化偏好** | ✅ 通过 | 低风险命令自动执行策略 |
| **XII. 语言规范** | ✅ 通过 | 所有文档和注释使用中文 |

**宪法检查结果**: ✅ 通过，无违规项

## Project Structure

### Documentation (this feature)

```text
specs/001-pixelverse-blog/
├── spec.md              # 功能规格文档
├── plan.md              # 本文件 - 实施计划
├── research.md          # Phase 0 输出 - 技术研究
├── data-model.md        # Phase 1 输出 - 数据模型
├── quickstart.md        # Phase 1 输出 - 快速开始指南
├── contracts/           # Phase 1 输出 - API 契约
│   ├── frontmatter-schema.json    # MDX frontmatter JSON Schema
│   ├── theme-variables.css        # CSS 变量定义
│   └── component-props/           # 组件 Props 类型定义
└── checklists/
    └── requirements.md  # 规格质量检查清单
```

### Source Code (repository root)

```text
src/
├── components/           # React 交互组件（Islands）
│   ├── ui/              # 基础 UI 组件
│   │   ├── Button/
│   │   ├── Callout/
│   │   ├── Tabs/
│   │   └── Accordion/
│   ├── code/            # 代码相关组件
│   │   ├── CodePlayground/
│   │   ├── CodeBlock/
│   │   └── SandpackEmbed/
│   ├── layout/          # 布局组件
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── TOC/
│   ├── interactive/     # 交互组件
│   │   ├── CommandPalette/
│   │   ├── ThemeToggle/
│   │   ├── Search/
│   │   └── NewsletterForm/
│   └── social/          # 社交组件
│       ├── ShareButtons/
│       ├── Reactions/
│       ├── GiscusComments/
│       └── SocialLinks/
├── layouts/             # Astro 布局模板
│   ├── BaseLayout.astro
│   ├── PostLayout.astro
│   ├── ListLayout.astro
│   └── PageLayout.astro
├── pages/               # Astro 页面路由
│   ├── index.astro      # 首页
│   ├── blog/
│   │   ├── index.astro  # 博客列表
│   │   └── [...slug].astro  # 文章详情
│   ├── projects/
│   │   └── index.astro  # 项目页
│   ├── about/
│   │   └── index.astro  # 关于页
│   ├── tags/
│   │   ├── index.astro  # 标签云
│   │   └── [tag].astro  # 标签文章列表
│   ├── uses/
│   │   └── index.astro  # Uses 页
│   └── privacy/
│       └── index.astro  # 隐私政策
├── content/             # MDX 内容集合
│   ├── blog/            # 博客文章 MDX 文件
│   ├── projects/        # 项目数据
│   ├── config.ts        # 内容集合配置
│   └── schema.ts        # Frontmatter Schema
├── data/                # 静态数据
│   ├── author.json      # 作者信息
│   ├── social.json      # 社交链接
│   ├── status.json      # 全局状态栏数据
│   └── navigation.json  # 导航配置
├── styles/              # 全局样式
│   ├── global.css       # 全局 CSS
│   ├── themes/          # 主题变量
│   │   ├── dark.css
│   │   └── light.css
│   └── typography.css   # 排版样式
├── utils/               # 工具函数
│   ├── date.ts          # 日期处理
│   ├── reading-time.ts  # 阅读时间计算
│   ├── seo.ts           # SEO 工具
│   └── content.ts       # 内容处理
├── hooks/               # Astro 集成钩子
│   └── og-image.ts      # OG 图片生成
├── integrations/        # Astro 集成配置
│   ├── mdx.ts
│   ├── tailwind.ts
│   ├── sitemap.ts
│   └── pagefind.ts
└── env.d.ts             # 环境变量类型

public/                  # 静态资源
├── fonts/               # 字体文件
├── images/              # 图片资源
│   ├── og/              # OG 图片
│   └── blog/            # 博客图片
├── favicon.ico
├── manifest.json        # PWA Manifest
└── robots.txt

tests/
├── unit/                # 单元测试
│   ├── components/
│   ├── utils/
│   └── layouts/
├── integration/         # 集成测试
│   ├── pages/
│   ├── content/
│   └── api/
└── e2e/                 # E2E 测试
    ├── reading.spec.ts
    ├── navigation.spec.ts
    ├── theme.spec.ts
    └── accessibility.spec.ts

astro.config.mjs         # Astro 配置
tailwind.config.mjs      # Tailwind 配置
tsconfig.json            # TypeScript 配置
package.json
```

**Structure Decision**: 采用 Astro 静态站点生成器推荐的目录结构，核心区分：
- `src/components/` - React 交互组件（Islands Architecture，按需加载 JS）
- `src/layouts/` - Astro 布局模板（纯静态，零 JS）
- `src/pages/` - Astro 页面路由（文件系统路由）
- `src/content/` - MDX 内容集合（类型安全的内容管理）
- `tests/` - 测试目录（单元/集成/E2E 分离）

## Complexity Tracking

> 无宪法违规项，此表为空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |