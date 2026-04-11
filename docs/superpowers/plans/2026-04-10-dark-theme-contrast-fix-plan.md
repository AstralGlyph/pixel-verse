# 暗色主题对比度优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 blog 前台页面暗色主题下的颜色对比度问题，使所有文字和交互元素达到 WCAG AA 标准

**Architecture:** 更新暗色主题 CSS 变量（accent/text/border 提升到更高明度），将 blog 页面中的硬编码 Tailwind 颜色类替换为语义化变量（text-accent, text-text-primary 等），修复代码块边框对比度

**Tech Stack:** Astro 5.x, Tailwind CSS v4, OKLCH 色彩空间, CSS 变量

---

### Task 1: 更新暗色主题 CSS 变量

**Files:**
- Modify: `src/styles/themes/dark.css`

- [ ] **Step 1: 更新暗色主题变量**

修改 `src/styles/themes/dark.css` 中的以下变量（两处：主声明块 和 `@media (prefers-color-scheme: dark)` 块）。

主声明块（第 23-36 行附近），将：

```css
  --color-accent-primary: oklch(55% 0.32 260);
  --color-accent-secondary: oklch(62% 0.3 270);
  --color-accent-muted: oklch(42% 0.18 260);
```

替换为：

```css
  --color-accent-primary: oklch(76% 0.18 155);
  --color-accent-secondary: oklch(80% 0.16 150);
  --color-accent-muted: oklch(60% 0.15 155);
  --color-accent-hover: oklch(82% 0.14 148);
```

将第 19 行 `--color-text-tertiary` 从 `oklch(58% 0.02 260)` 更新为 `oklch(68% 0.02 260)`。

将第 34 行 `--color-border-primary` 从 `oklch(28% 0.05 260)` 更新为 `oklch(35% 0.05 260)`。

同步更新 `@media (prefers-color-scheme: dark)` 块（第 93-97 行）中的对应值。

最终完整的 `dark.css` 文件应保持现有结构，只变更值。

- [ ] **Step 2: 验证文件完整性**

运行：
```bash
grep -n "oklch" src/styles/themes/dark.css | head -20
```
确认 accent-primary = 76%、text-tertiary = 68%、border-primary = 35%、accent-hover 存在。

- [ ] **Step 3: 提交**

```bash
git add src/styles/themes/dark.css
git commit -m "style(theme): 优化暗色主题对比度 — 薄荷绿强调色，提升文字和边框亮度"
```

---

### Task 2: 修复代码块边框对比度

**Files:**
- Modify: `src/styles/typography.css`

- [ ] **Step 1: 更新代码块边框**

修改 `src/styles/typography.css` 第 118 行，将 `pre` 元素的暗色主题边框：

```css
    border-color: oklch(22% 0.06 260) !important;
```

替换为：

```css
    border-color: oklch(35% 0.06 260) !important;
```

同时更新第 105 行的 fallback 颜色：

```css
    border-color: rgb(65, 65, 95) !important;
```

- [ ] **Step 2: 提交**

```bash
git add src/styles/typography.css
git commit -m "fix(typography): 提高暗色主题代码块边框对比度"
```

---

### Task 3: 修复 blog 详情页硬编码类

**Files:**
- Modify: `src/pages/blog/ssr/[slug].astro`

- [ ] **Step 1: 替换分类标签、标签、摘要的硬编码类**

修改 `src/pages/blog/ssr/[slug].astro` 中的 3 处硬编码颜色类。

第 85 行，分类标签 — 将：
```astro
              <a href={`/blog/ssr?category=${post.category.slug}`} class="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
```
替换为：
```astro
              <a href={`/blog/ssr?category=${post.category.slug}`} class="rounded-full bg-bg-tertiary px-3 py-1 text-xs text-accent-primary border border-border-primary hover:border-accent-primary">
```

第 93 行，标签 — 将：
```astro
                <a href={`/blog/ssr?tag=${tag.slug}`} class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
```
替换为：
```astro
                <a href={`/blog/ssr?tag=${tag.slug}`} class="rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-secondary border border-border-primary hover:border-accent-primary">
```

第 103 行，摘要 — 将：
```astro
          <div class="mb-8 rounded-lg bg-gray-50 p-4 text-text-secondary italic">
```
替换为：
```astro
          <div class="mb-8 rounded-lg bg-bg-secondary p-4 text-text-secondary italic">
```

同时修改第 208 行 style 块中的 checkbox 样式（暗色主题下边框需要调整）：
将：
```css
    @apply w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer;
```
替换为：
```css
    @apply w-5 h-5 rounded border-border-primary text-accent-primary cursor-pointer;
```

- [ ] **Step 2: 提交**

```bash
git add "src/pages/blog/ssr/[slug].astro"
git commit -m "fix(blog): 替换详情页硬编码颜色类为语义变量"
```

---

### Task 4: 修复 blog 列表页硬编码类

**Files:**
- Modify: `src/pages/blog/ssr.astro`

- [ ] **Step 1: 替换筛选按钮和统计文字的硬编码类**

修改 `src/pages/blog/ssr.astro`。

第 59 行和第 70 行（上一页/下一页按钮），将：
```astro
              class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
```
替换为：
```astro
              class="rounded border border-border-primary px-3 py-1 text-sm hover:bg-bg-tertiary"
```

第 64 行（页码统计文字），将：
```astro
          <span class="text-sm text-gray-600">
```
替换为：
```astro
          <span class="text-sm text-text-tertiary">
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/blog/ssr.astro
git commit -m "fix(blog): 替换列表页硬编码颜色类为语义变量"
```

---

### Task 5: 修复动态页面导航栏硬编码类

**Files:**
- Modify: `src/pages/[...slug].astro`

- [ ] **Step 1: 替换导航栏和背景的硬编码类**

修改 `src/pages/[...slug].astro`。

第 50 行，body — 将：
```astro
  <body class="bg-white text-gray-900">
```
替换为：
```astro
  <body class="bg-bg-primary text-text-primary">
```

第 51 行，header — 将：
```astro
    <header class="border-b border-gray-200">
```
替换为：
```astro
    <header class="border-b border-border-primary">
```

第 53 行，Logo — 将：
```astro
        <a href="/" class="text-xl font-bold text-gray-900">Pixel Verse</a>
```
替换为：
```astro
        <a href="/" class="text-xl font-bold text-text-primary">Pixel Verse</a>
```

第 55-56 行，导航链接 — 将：
```astro
          <a href="/blog/ssr" class="text-gray-600 hover:text-gray-900">博客</a>
          <a href="/admin" class="text-gray-600 hover:text-gray-900">后台</a>
```
替换为：
```astro
          <a href="/blog/ssr" class="text-text-tertiary hover:text-text-primary">博客</a>
          <a href="/admin" class="text-text-tertiary hover:text-text-primary">后台</a>
```

第 68 行，footer border — 将：
```astro
    <footer class="border-t border-gray-200 mt-16">
```
替换为：
```astro
    <footer class="border-t border-border-primary mt-16">
```

第 69 行，footer 文字 — 将：
```astro
      <div class="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
```
替换为：
```astro
      <div class="max-w-4xl mx-auto px-4 py-6 text-center text-text-tertiary text-sm">
```

- [ ] **Step 2: 提交**

```bash
git add "src/pages/[...slug].astro"
git commit -m "fix(pages): 替换动态页面导航栏硬编码颜色类为语义变量"
```

---

### Task 6: 构建验证和视觉检查

- [ ] **Step 1: 构建验证**

运行：
```bash
pnpm build
```
预期：构建成功，无 CSS 或编译错误。

- [ ] **Step 2: 启动开发服务器并手动验证**

运行：
```bash
pnpm dev
```
然后打开 http://localhost:4321/blog/ssr 和任意文章页，切换到暗色主题后检查：

- [ ] 文章页链接显示为薄荷绿色，清晰可辨
- [ ] 分类标签和标签徽章在暗色背景下可见
- [ ] 时间/统计文字（三级文字）清晰可读
- [ ] 代码块边框边界清晰可见
- [ ] 分页按钮边框和 hover 效果正常
- [ ] 切换回亮色主题后不受影响

- [ ] **Step 3: 最终提交**

```bash
git commit --allow-empty -m "chore: 验证暗色主题对比度优化完成"
```
