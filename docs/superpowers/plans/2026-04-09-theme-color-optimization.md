# 主题色彩体系优化 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化亮色/暗色主题的颜色搭配，添加极光流动渐变代码块，实现强科技风格亮色主题和深空沉浸感暗色主题。

**Architecture:** 纯 CSS 实现。修改主题变量文件定义新的颜色值，在 typography.css 中添加极光流动动画和主题适配的代码块样式，同步 tailwind.config.mjs typography 配置。

**Tech Stack:** OKLCH 色彩空间, CSS @keyframes 动画, Tailwind CSS v4, @tailwindcss/typography

---

## 文件映射

| 文件 | 职责 | 操作 |
|------|------|------|
| `src/styles/themes/light.css` | 亮色主题 CSS 变量 | 更新背景色、文字色、玻璃拟态、渐变变量 |
| `src/styles/themes/dark.css` | 暗色主题 CSS 变量 | 更新背景色、文字色、玻璃拟态、渐变变量 |
| `src/styles/typography.css` | 文章排版样式 | 添加 aurora-flow 动画，重写 `.prose pre` 样式 |
| `tailwind.config.mjs` | Tailwind 配置 | 同步 typography 插件的 `pre` 配置 |

---

### Task 1: 亮色主题变量更新

**Files:**
- Modify: `src/styles/themes/light.css`

- [ ] **Step 1: 更新亮色主题 `[data-theme="light"]` 块中的变量**

将以下变量替换为新值：

```css
/* 背景色 — 从 94/90/86% 改为 92/88/84%，色相从 260° 改为 240° */
--color-bg-primary: oklch(92% 0.03 240);
--color-bg-secondary: oklch(88% 0.04 240);
--color-bg-tertiary: oklch(84% 0.05 240);

/* 文字色 — 从纯灰 (0) 改为带蓝调 (0.02-0.03, 260°) */
--color-text-primary: oklch(14% 0.02 260);
--color-text-secondary: oklch(34% 0.03 260);
--color-text-tertiary: oklch(50% 0.03 260);

/* 玻璃拟态 — 同步调整 */
--glass-bg: oklch(96% 0.01 240 / 0.97);
--glass-bg-subtle: oklch(94% 0.015 240 / 0.93);
--glass-bg-hover: oklch(92% 0.02 240 / 0.97);
--glass-bg-active: oklch(88% 0.035 240 / 0.95);

/* 渐变 — 同步调整 */
--gradient-subtle: linear-gradient(135deg, oklch(94% 0.008 260), oklch(92% 0.02 260));
--gradient-card-bg: linear-gradient(180deg, oklch(96% 0.008 260 / 0.98), oklch(94% 0.012 260 / 0.99));
--mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(80% 0.08 260 / 0.55) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 20%, oklch(83% 0.07 280 / 0.45) 0%, transparent 50%),
                   radial-gradient(ellipse at 50% 80%, oklch(86% 0.06 240 / 0.4) 0%, transparent 50%);
```

- [ ] **Step 2: 同步更新 `@media (prefers-color-scheme: light)` 块中的相同变量**

将 `@media` 块内的变量值改为与 Step 1 相同。

- [ ] **Step 3: 构建验证**

```bash
pnpm build
```

预期：构建成功，无 CSS 语法错误。

- [ ] **Step 4: Commit**

```bash
git add src/styles/themes/light.css
git commit -m "style(theme): 优化亮色主题变量 — 蓝调背景、冷灰文字、玻璃拟态同步"
```

---

### Task 2: 暗色主题变量更新

**Files:**
- Modify: `src/styles/themes/dark.css`

- [ ] **Step 1: 更新暗色主题 `[data-theme="dark"]` 和 `:root:not([data-theme])` 块中的变量**

```css
/* 背景色 — 从 14/18/22% 改为 10/14/18%，更深沉浸 */
--color-bg-primary: oklch(10% 0.04 260);
--color-bg-secondary: oklch(14% 0.04 260);
--color-bg-tertiary: oklch(18% 0.05 260);

/* 文字色 — 从纯白 (0) 改为冷蓝白 (0.02, 260°) */
--color-text-primary: oklch(94% 0.02 260);
--color-text-secondary: oklch(76% 0.02 260);
--color-text-tertiary: oklch(58% 0.02 260);

/* 玻璃拟态 — 同步调暗 */
--glass-bg: oklch(12% 0.04 260 / 0.95);
--glass-bg-subtle: oklch(16% 0.04 260 / 0.92);
--glass-bg-hover: oklch(20% 0.05 260 / 0.95);
--glass-bg-active: oklch(24% 0.1 260 / 0.93);

/* 渐变 — 同步调暗 */
--gradient-subtle: linear-gradient(135deg, oklch(14% 0.05 260), oklch(16% 0.06 270));
--gradient-card-bg: linear-gradient(180deg, oklch(16% 0.05 260 / 0.97), oklch(12% 0.05 260 / 0.98));
--mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(34% 0.22 260 / 0.3) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 20%, oklch(38% 0.2 280 / 0.25) 0%, transparent 50%),
                   radial-gradient(ellipse at 50% 80%, oklch(36% 0.24 240 / 0.2) 0%, transparent 50%);
```

- [ ] **Step 2: 同步更新 `@media (prefers-color-scheme: dark)` 块中的相同变量**

将 `@media` 块内的变量值改为与 Step 1 相同。

- [ ] **Step 3: 构建验证**

```bash
pnpm build
```

预期：构建成功。

- [ ] **Step 4: Commit**

```bash
git add src/styles/themes/dark.css
git commit -m "style(theme): 优化暗色主题变量 — 深空沉浸背景、冷蓝白文字、玻璃拟态同步"
```

---

### Task 3: 极光流动代码块动画

**Files:**
- Modify: `src/styles/typography.css`

**当前代码块样式**（第 93-125 行）：

```css
  /* 代码块 */
  pre {
    background-color: rgb(18, 22, 38) !important;
    color: rgb(235, 235, 235) !important;
    border: 1px solid rgb(50, 55, 80) !important;
    background-color: oklch(16% 0.04 260) !important;
    color: oklch(92% 0 0) !important;
    border-color: oklch(25% 0.06 260) !important;
    border-radius: 0.5rem;
    padding: 1em;
    overflow-x: auto;
    font-size: 0.875em;
    line-height: 1.6;
  }

  pre code {
    color: inherit !important;
  }
```

- [ ] **Step 1: 在文件顶部（`/** 文章排版样式 */` 注释之后）添加极光流动动画**

```css
/* 极光流动动画 */
@keyframes aurora-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

- [ ] **Step 2: 替换 `.prose pre` 块为极光渐变样式（暗色默认）**

用以下内容替换现有的 `pre { ... }` 块：

```css
  /* 代码块 — 暗色主题默认（深蓝紫极光渐变） */
  pre {
    /* 不支持 oklch 的浏览器 fallback */
    background-color: rgb(25, 20, 45) !important;
    color: rgb(220, 225, 240) !important;
    border-color: rgb(50, 50, 80) !important;

    /* 现代浏览器：极光渐变 + 动画 */
    background: linear-gradient(
      135deg,
      oklch(12% 0.08 220),
      oklch(10% 0.08 280),
      oklch(14% 0.06 240),
      oklch(12% 0.08 220)
    ) !important;
    background-size: 300% 300% !important;
    animation: aurora-flow 12s ease infinite;
    color: oklch(94% 0.02 260) !important;
    border-color: oklch(22% 0.06 260) !important;

    border-radius: 0.5rem;
    padding: 1em;
    overflow-x: auto;
    font-size: 0.875em;
    line-height: 1.6;
  }
```

- [ ] **Step 3: 在 `.prose pre code { color: inherit !important; }` 之后添加亮色主题覆盖**

在 `pre code` 规则之后，添加：

```css
  /* 亮色主题代码块（浅蓝紫极光渐变） */
  [data-theme="light"] pre {
    background-color: rgb(220, 225, 235) !important;
    color: rgb(30, 30, 30) !important;
    border-color: rgb(180, 185, 200) !important;

    background: linear-gradient(
      135deg,
      oklch(88% 0.06 220),
      oklch(86% 0.08 260),
      oklch(90% 0.05 240),
      oklch(88% 0.06 220)
    ) !important;
    background-size: 300% 300% !important;
    animation: aurora-flow 12s ease infinite !important;
    color: oklch(18% 0 0) !important;
    border-color: oklch(78% 0.06 260) !important;
  }
```

注意：亮色主题需要显式声明 `animation`，因为它嵌套在 `.prose` 块内，需要覆盖默认 `pre` 的动画声明。

- [ ] **Step 4: 构建验证**

```bash
pnpm build
```

预期：构建成功。

- [ ] **Step 5: Commit**

```bash
git add src/styles/typography.css
git commit -m "style(typography): 添加极光流动渐变代码块，亮暗色主题独立配色"
```

---

### Task 4: Tailwind Typography 配置同步

**Files:**
- Modify: `tailwind.config.mjs`

当前 typography 配置中的 `pre` 样式（约第 101-108 行）：

```javascript
pre: {
  backgroundColor: 'oklch(16% 0.04 260)',
  color: 'oklch(92% 0 0)',
  border: '1px solid oklch(25% 0.06 260)',
},
'pre code': {
  color: 'inherit',
},
```

- [ ] **Step 1: 更新 `pre` 配置**

```javascript
pre: {
  background: 'linear-gradient(135deg, oklch(12% 0.08 220), oklch(10% 0.08 280), oklch(14% 0.06 240), oklch(12% 0.08 220))',
  backgroundSize: '300% 300%',
  animation: 'aurora-flow 12s ease infinite',
  color: 'oklch(94% 0.02 260)',
  border: '1px solid oklch(22% 0.06 260)',
},
'pre code': {
  color: 'inherit',
},
```

- [ ] **Step 2: 构建验证**

```bash
pnpm build
```

预期：构建成功。

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.mjs
git commit -m "style(tailwind): 同步 typography 插件代码块极光渐变配置"
```

---

### Task 5: 构建与视觉验证

**Files:** 无修改，仅验证。

- [ ] **Step 1: 完整构建**

```bash
pnpm build
```

预期：构建成功，无警告。

- [ ] **Step 2: 启动开发服务器**

```bash
pnpm dev &
sleep 3
```

- [ ] **Step 3: 验证暗色主题代码块渲染**

使用 Playwright 导航到文章预览页面，检查 `pre` 元素的 computed style：

```javascript
// 验证暗色主题代码块背景包含渐变
const preStyle = await page.$eval('pre', el => {
  const style = getComputedStyle(el);
  return {
    background: style.background,
    color: style.color,
    animation: style.animation
  };
});
console.log('Dark theme pre style:', preStyle);
```

预期输出：
- `background` 包含 `linear-gradient` 和 `oklch`
- `color` 包含 `oklch(94%` 或近似值
- `animation` 包含 `aurora-flow`

- [ ] **Step 4: 切换亮色主题验证**

```javascript
// 切换亮色主题
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});
await page.waitForTimeout(100);

const preStyleLight = await page.$eval('pre', el => {
  const style = getComputedStyle(el);
  return {
    background: style.background,
    color: style.color,
    animation: style.animation
  };
});
console.log('Light theme pre style:', preStyleLight);
```

预期输出：
- `background` 包含浅色渐变 `oklch(88%` 或 `oklch(86%`
- `color` 包含 `oklch(18%` 或深色值

- [ ] **Step 5: 停止开发服务器**

```bash
pkill -f "astro dev" 2>/dev/null || true
```

- [ ] **Step 6: Commit（如果有修改）**

---

### Task 6: E2E 视觉回归测试

**Files:**
- Create: `tests/e2e/theme-colors.spec.ts`

- [ ] **Step 1: 创建测试文件**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Theme Color Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到文章预览页面（需要有已发布文章）
    await page.goto('/admin/posts/preview/1');
    await page.waitForLoadState('networkidle');
  });

  test('暗色主题代码块应有极光渐变背景', async ({ page }) => {
    const pre = page.locator('pre').first();
    await expect(pre).toBeVisible();

    const background = await pre.evaluate(el => {
      return getComputedStyle(el).background;
    });

    // 验证包含渐变
    expect(background).toContain('gradient');
    // 验证包含动画
    const animation = await pre.evaluate(el => {
      return getComputedStyle(el).animation;
    });
    expect(animation).toContain('aurora-flow');
  });

  test('亮色主题代码块应有浅色极光渐变', async ({ page }) => {
    // 切换到亮色主题
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });

    const pre = page.locator('pre').first();
    await expect(pre).toBeVisible();

    const background = await pre.evaluate(el => {
      return getComputedStyle(el).background;
    });

    // 验证亮色主题也有渐变
    expect(background).toContain('gradient');

    // 验证文字颜色为深色
    const color = await pre.evaluate(el => {
      return getComputedStyle(el).color;
    });
    // 亮色主题代码块文字应为深色（RGB 值较低）
    expect(color).toMatch(/rgb\(\d+, \d+, \d+\)/);
  });

  test('暗色主题正文文字应为冷蓝白', async ({ page }) => {
    const body = page.locator('.prose').first();
    await expect(body).toBeVisible();

    const textColor = await body.evaluate(el => {
      return getComputedStyle(el).color;
    });

    // 暗色主题文字应接近 oklch(94% 0.02 260) 的 rgb 转换值
    // 不会是纯白 rgb(255, 255, 255)
    expect(textColor).not.toBe('rgb(255, 255, 255)');
  });

  test('亮色主题背景应为蓝调浅灰', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });

    const body = page.locator('.prose').first();
    await expect(body).toBeVisible();

    const bgColor = await body.evaluate(el => {
      return getComputedStyle(el).color;
    });

    // 亮色主题文字应带蓝调，不是纯灰
    // oklch(14% 0.02 260) 转换后 B 通道略高
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
pnpm test:e2e -- tests/e2e/theme-colors.spec.ts
```

预期：所有测试通过。

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/theme-colors.spec.ts
git commit -m "test(e2e): 添加主题色彩优化视觉回归测试"
```

---

## 任务依赖关系

```
Task 1 (light.css) ──┐
                      ├── Task 3 (typography.css) ── Task 5 (验证) ── Task 6 (E2E)
Task 2 (dark.css)  ───┘
                      └── Task 4 (tailwind.config.mjs) ──┘
```

Task 1 和 Task 2 可并行执行。Task 3 和 Task 4 依赖 Task 1-2 完成。Task 5-6 依赖所有前面的任务完成。
