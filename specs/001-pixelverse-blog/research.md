# Research: PixelVerse 个人博客系统

**Feature**: 001-pixelverse-blog  
**Date**: 2026-03-31  
**Purpose**: 解决技术上下文中的未知项，确立技术决策和最佳实践

---

## 1. 框架选型：Astro vs Next.js vs Remix

### Decision
选择 **Astro 5.x** 作为主框架

### Rationale
1. **Islands Architecture**: Astro 原生支持 Islands Architecture，默认零 JS 输出，仅在需要交互的区域（Islands）加载 JavaScript，完美契合"核心阅读体验不依赖 JS"的需求
2. **性能优先**: Astro 生成的页面默认为纯静态 HTML，无需客户端水合（Hydration），首屏加载极快
3. **MDX 原生支持**: Astro 内置 MDX 支持，内容集合（Content Collections）提供类型安全的内容管理
4. **框架无关**: 可以混用 React/Vue/Svelte 组件，本次使用 React Islands
5. **构建时优化**: Shiki 代码高亮、图片优化、OG 图片生成均在构建时完成，无运行时开销

### Alternatives Considered
- **Next.js**: 需要 SSR/SSG 混合模式，默认会加载 React 运行时，Bundle 较大
- **Remix**: 更适合动态 Web 应用，对静态博客场景过度设计
- **Nuxt/VuePress**: 团队更熟悉 React 生态，Vue 方案学习成本高

---

## 2. 样式方案：Tailwind CSS v4 + CSS Variables

### Decision
选择 **Tailwind CSS v4** 配合 CSS Custom Properties（CSS 变量）

### Rationale
1. **原子化 CSS 零运行时**: Tailwind v4 采用 Oxide 引擎，编译时生成最小化 CSS，无运行时开销
2. **CSS 变量驱动主题**: 所有颜色、间距、字号通过 CSS Custom Properties 定义，主题切换仅修改变量值，无需重新加载样式
3. **暗色模式原生支持**: `dark:` 变体和 `prefers-color-scheme` 媒体查询开箱即用
4. **响应式设计**: 内置响应式断点和 `clamp()` 工具类，实现流体布局

### Best Practices
```css
/* 主题变量定义 */
:root {
  --color-bg: oklch(98% 0 0);
  --color-text: oklch(20% 0 0);
  --color-primary: oklch(60% 0.2 250);
}

[data-theme="dark"] {
  --color-bg: oklch(15% 0 0);
  --color-text: oklch(95% 0 0);
}
```

### Alternatives Considered
- **CSS-in-JS (styled-components/emotion)**: 运行时开销，与 Islands Architecture 理念冲突
- **UnoCSS**: 更轻量，但生态和工具链不如 Tailwind 成熟

---

## 3. 代码高亮：Shiki vs Prism vs Highlight.js

### Decision
选择 **Shiki** 作为代码高亮引擎

### Rationale
1. **编译时高亮**: Shiki 在构建时生成高亮后的 HTML，零客户端 JS 运行时
2. **VS Code 级精度**: 使用 VS Code 相同的 TextMate 语法，支持 100+ 语言
3. **主题丰富**: 内置多种 VS Code 主题（GitHub Dark, One Dark Pro 等）
4. **行高亮支持**: 支持行号、特定行高亮、Diff 视图

### Best Practices
```astro
---
import { codeToHtml } from 'shiki'
const html = await codeToHtml(code, {
  lang: 'typescript',
  theme: 'github-dark',
  options: {
    lineNumbers: true,
    highlightLines: [2, 3, '4-6']
  }
})
---
```

### Alternatives Considered
- **Prism**: 客户端运行时高亮，影响性能
- **Highlight.js**: 自动语言检测不够精确，主题选择较少

---

## 4. 代码游乐场：Sandpack vs CodeSandbox Embed

### Decision
选择 **Sandpack**（CodeSandbox 官方开源方案）

### Rationale
1. **完全可控**: Sandpack 是开源项目，可在本地运行，不依赖外部服务
2. **轻量**: 核心包约 30KB gzipped，支持按需加载
3. **React 集成**: 提供官方 React 组件 `@codesandbox/sandpack-react`
4. **多模板支持**: 支持 React、Vue、Vanilla JS、Node.js 等模板

### Best Practices
```tsx
import { Sandpack } from "@codesandbox/sandpack-react";

function CodePlayground() {
  return (
    <Sandpack
      template="react"
      files={{
        "/App.js": codeString
      }}
      options={{
        showNavigator: true,
        showTabs: true,
        editorHeight: 400
      }}
    />
  );
}
```

### Alternatives Considered
- **CodeSandbox Embed**: 需要依赖外部服务，加载较慢
- **StackBlitz**: 功能强大但 Bundle 较大，更适合完整项目演示

---

## 5. 搜索方案：Pagefind vs Fuse.js

### Decision
选择 **Pagefind** 作为全文搜索方案

### Rationale
1. **构建时索引**: Pagefind 在构建时生成搜索索引，无需服务器
2. **零依赖**: 不依赖外部搜索服务，完全本地化
3. **轻量**: 搜索 UI 仅约 10KB gzipped
4. **模糊搜索**: 支持模糊匹配和搜索结果高亮

### Best Practices
```astro
---
// astro.config.mjs
import pagefind from '@pagefind/astro';
export default {
  integrations: [pagefind()]
}
---
```

```html
<!-- 搜索组件 -->
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
  new PagefindUI({ element: "#search", showSubResults: true });
</script>
```

### Alternatives Considered
- **Fuse.js**: 纯客户端模糊搜索，需要加载完整索引，大数据集性能差
- **Algolia DocSearch**: 免费但需申请，依赖外部服务

---

## 6. 评论系统：Giscus vs Disqus vs Utterances

### Decision
选择 **Giscus**（基于 GitHub Discussions）

### Rationale
1. **无服务器**: 完全依赖 GitHub，无需自建后端
2. **隐私友好**: 数据存储在 GitHub，符合 GDPR 要求
3. **Markdown 支持**: 支持 Markdown 格式评论和代码块
4. **反应表情**: 支持 GitHub 风格的 emoji 反应

### Best Practices
```tsx
import Giscus from '@giscus/react';

function Comments() {
  return (
    <Giscus
      repo="owner/repo"
      repoId="..."
      category="Announcements"
      categoryId="..."
      mapping="pathname"
      theme="preferred_color_scheme"
      lang="zh-CN"
    />
  );
}
```

### Alternatives Considered
- **Disqus**: 广告、隐私问题、加载缓慢
- **Utterances**: 基于 GitHub Issues，功能较简单

---

## 7. 部署平台：Vercel vs Cloudflare Pages

### Decision
推荐 **Cloudflare Pages**（也可选择 Vercel）

### Rationale
1. **全球 Edge 网络**: Cloudflare 在全球有更多边缘节点，TTFB 更低
2. **免费额度慷慨**: 免费版支持无限带宽，适合博客场景
3. **KV 存储**: Cloudflare KV 适合存储阅读量统计数据
4. **Analytics**: Cloudflare Web Analytics 隐私友好，无需 Cookie

### Best Practices
```toml
# wrangler.toml (Cloudflare 配置)
name = "pixelverse-blog"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[kv_namespaces]]
binding = "VIEW_COUNT"
id = "..."
```

### Alternatives Considered
- **Vercel**: 更好的开发者体验，但免费版带宽限制较严格
- **Netlify**: 功能全面，但 Edge 性能略逊

---

## 8. 动画方案：Framer Motion + View Transitions API

### Decision
采用 **Framer Motion**（组件级动画）+ **View Transitions API**（页面过渡）组合

### Rationale
1. **Framer Motion**: React 生态最佳动画库，声明式 API，支持手势交互
2. **View Transitions API**: 原生浏览器 API，跨页面元素过渡动画，性能最优
3. **渐进增强**: 不支持 View Transitions 的浏览器自动降级为即时切换

### Best Practices
```tsx
// Framer Motion 组件动画
import { motion } from 'framer-motion';

motion.div({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
})
```

```js
// View Transitions API 页面过渡
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // DOM 更新
  });
}
```

### Alternatives Considered
- **GSAP**: 功能强大但体积较大，对简单动画过度设计
- **React Spring**: 物理动画库，学习曲线陡峭

---

## 9. 字体优化策略

### Decision
采用 **可变字体（Variable Fonts）** + **字体子集化** + **font-display: swap**

### Rationale
1. **可变字体**: 一个文件包含多种字重和样式，减少请求数
2. **子集化**: 仅包含使用到的字符，大幅减小文件体积
3. **font-display: swap**: 先显示系统字体，字体加载后替换，避免 FOIT

### Best Practices
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+4E00-9FFF; /* 中文子集 */
}
```

---

## 10. 无障碍（Accessibility）最佳实践

### Key Practices
1. **语义化 HTML**: 使用正确的 HTML 元素（`<article>`, `<nav>`, `<main>`, `<aside>`）
2. **ARIA 标记**: 为自定义组件添加正确的 `role` 和 `aria-*` 属性
3. **焦点管理**: 清晰可见的焦点样式，不使用 `outline: none`
4. **对比度**: 文本对比度达到 4.5:1（大字号 3:1）
5. **键盘导航**: 所有交互元素可通过 Tab/Enter/Esc 操作
6. **Skip Link**: 页面顶部隐藏的"跳转到主内容"链接

### Testing Tools
- **axe DevTools**: 自动化无障碍测试
- **NVDA/VoiceOver**: 屏幕阅读器测试
- **Lighthouse Accessibility Audit**: CI/CD 集成

---

## 11. 性能优化清单

### 构建时优化
- [x] 图片自动优化（WebP/AVIF、响应式 srcset、LQIP）
- [x] 字体子集化和可变字体
- [x] Shiki 编译时代码高亮
- [x] OG 图片自动生成
- [x] 搜索索引构建（Pagefind）
- [x] RSS/Sitemap 自动生成

### 运行时优化
- [x] Islands Architecture（按需加载 JS）
- [x] 组件懒加载（IntersectionObserver）
- [x] 预取（hover 时 prefetch）
- [x] Service Worker 缓存
- [x] Edge CDN 部署

### 监控指标
- LCP < 1.5s
- CLS < 0.05
- INP < 200ms
- Lighthouse Performance > 95

---

## 12. 测试策略

### 单元测试（Vitest）
- 工具函数测试（阅读时间计算、日期格式化、SEO 工具）
- 组件测试（React Testing Library）
- 覆盖率目标：≥ 80%

### 集成测试
- 内容集合 Schema 验证
- Frontmatter 解析正确性
- 构建流程完整性

### E2E 测试（Playwright）
- 关键用户流程：阅读文章、导航搜索、主题切换
- 无障碍测试：键盘导航、屏幕阅读器兼容
- 性能测试：LCP、CLS 指标验证

---

## Research Summary

所有技术决策均已确定，无 `NEEDS CLARIFICATION` 项遗留。关键技术选型：

| 领域 | 选择 | 理由 |
|------|------|------|
| 框架 | Astro 5.x | Islands Architecture，默认零 JS |
| 样式 | Tailwind CSS v4 | 原子化零运行时，CSS 变量驱动主题 |
| 代码高亮 | Shiki | 编译时高亮，VS Code 级精度 |
| 代码游乐场 | Sandpack | 开源可控，React 集成 |
| 搜索 | Pagefind | 构建时索引，零依赖 |
| 评论 | Giscus | 无服务器，GitHub Discussions |
| 部署 | Cloudflare Pages | 全球 Edge，免费额度 generous |
| 动画 | Framer Motion + View Transitions | 组件级 + 页面级组合 |

可以进入 Phase 1 设计阶段。