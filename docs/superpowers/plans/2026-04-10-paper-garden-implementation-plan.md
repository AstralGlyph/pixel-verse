# Paper Garden CMS 后台重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CMS 后台从 Glassmorphism + 冷蓝色调重设计为 "Paper Garden" 纸花园风格 — 暖色调、柔和阴影、可收起浮动侧边栏。

**Architecture:** 通过更新 CSS 变量和 `.glass-card` 类定义来实现全局样式升级，然后重构 Sidebar 为"书脊"式浮动面板，最后更新组件和布局。

**Tech Stack:** TypeScript, React, Astro, Tailwind CSS v3, CSS Variables (OKLCH), Lucide React

---

### Task 1: 重写亮色主题 CSS 变量

**Files:**
- Modify: `src/styles/themes/light.css`

- [ ] **Step 1: 重写亮色主题变量**

将 `src/styles/themes/light.css` 中 `[data-theme="light"]` 和 `@media (prefers-color-scheme: light)` 块内的所有变量替换为新值：

```css
/**
 * 亮色主题 CSS 变量定义
 * Paper Garden — 暖白底色 + 橄榄绿强调色
 */

[data-theme="light"] {
  /* === 背景色 — 暖白，纸张质感 === */
  --color-bg-primary: oklch(98% 0.008 85);
  --color-bg-secondary: oklch(95% 0.012 85);
  --color-bg-tertiary: oklch(92% 0.018 85);
  --color-bg-overlay: oklch(0% 0 0 / 0.4);

  /* === 卡片层 === */
  --color-card-bg: oklch(99.5% 0.003 85);
  --color-card-bg-hover: oklch(99% 0.005 85);

  /* === 文本色 — 深炭灰 === */
  --color-text-primary: oklch(22% 0.015 85);
  --color-text-secondary: oklch(45% 0.02 85);
  --color-text-tertiary: oklch(62% 0.015 85);
  --color-text-inverse: oklch(99% 0.003 85);

  /* === 强调色 — 橄榄绿 + 陶土橙 === */
  --color-accent-primary: oklch(52% 0.12 132);
  --color-accent-secondary: oklch(60% 0.15 45);
  --color-accent-muted: oklch(78% 0.06 132);
  --color-accent-hover: oklch(46% 0.11 132);

  /* === 语义色 === */
  --color-success: oklch(58% 0.14 145);
  --color-warning: oklch(72% 0.16 80);
  --color-error: oklch(52% 0.18 25);
  --color-info: oklch(52% 0.14 230);

  /* === 边框色 === */
  --color-border-primary: oklch(85% 0.02 85);
  --color-border-secondary: oklch(90% 0.015 85);
  --color-border-focus: oklch(52% 0.12 132);
  --color-border-accent: oklch(52% 0.12 132);

  /* === 阴影 — 多层柔和纸张阴影 === */
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.04),
               0 1px 1px oklch(0% 0 0 / 0.02);
  --shadow-md: 0 2px 4px oklch(0% 0 0 / 0.04),
               0 4px 8px oklch(0% 0 0 / 0.05),
               0 1px 2px oklch(0% 0 0 / 0.02);
  --shadow-lg: 0 4px 8px oklch(0% 0 0 / 0.04),
               0 12px 24px oklch(0% 0 0 / 0.07),
               0 2px 4px oklch(0% 0 0 / 0.03);
  --shadow-xl: 0 8px 16px oklch(0% 0 0 / 0.06),
               0 24px 48px oklch(0% 0 0 / 0.1),
               0 4px 8px oklch(0% 0 0 / 0.04);

  /* === 卡片阴影 === */
  --shadow-card: 0 2px 4px oklch(0% 0 0 / 0.03),
                 0 8px 16px oklch(0% 0 0 / 0.05),
                 0 1px 3px oklch(0% 0 0 / 0.02);
  --shadow-card-hover: 0 4px 8px oklch(0% 0 0 / 0.04),
                       0 16px 32px oklch(0% 0 0 / 0.08),
                       0 2px 6px oklch(0% 0 0 / 0.03);
  --shadow-floating: 0 8px 32px oklch(0% 0 0 / 0.08),
                     0 24px 48px oklch(0% 0 0 / 0.1),
                     0 4px 12px oklch(0% 0 0 / 0.04);

  /* === 玻璃拟态 — 暖色调半透明 === */
  --glass-bg: oklch(99% 0.005 85 / 0.92);
  --glass-bg-subtle: oklch(97% 0.008 85 / 0.88);
  --glass-bg-hover: oklch(95% 0.012 85 / 0.92);
  --glass-bg-active: oklch(93% 0.015 85 / 0.9);
  --glass-border: oklch(85% 0.02 85 / 0.7);
  --glass-border-subtle: oklch(90% 0.015 85 / 0.5);
  --glass-border-focus: oklch(52% 0.12 132 / 0.5);
  --glass-blur: blur(16px);
  --glass-blur-xl: blur(24px);
  --glass-shadow: 0 2px 8px oklch(0% 0 0 / 0.06);
  --glass-shadow-lg: 0 8px 32px oklch(0% 0 0 / 0.1);
  --glass-shadow-inset: inset 0 1px 0 oklch(100% 0 0 / 0.8);

  /* === 圆角 === */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-2xl: 32px;

  /* === 渐变 === */
  --gradient-primary: linear-gradient(135deg, oklch(52% 0.12 132), oklch(46% 0.11 145));
  --gradient-accent: linear-gradient(135deg, oklch(52% 0.12 132), oklch(60% 0.15 45));
  --gradient-subtle: linear-gradient(135deg, oklch(97% 0.005 85), oklch(95% 0.008 85));
  --gradient-card-bg: linear-gradient(180deg, oklch(99.5% 0.003 85), oklch(99% 0.004 85));
  --mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(96% 0.01 132 / 0.4) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 20%, oklch(95% 0.015 45 / 0.3) 0%, transparent 50%),
                   radial-gradient(ellipse at 50% 80%, oklch(97% 0.008 85 / 0.35) 0%, transparent 50%);

  /* === 动画 === */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-paper: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-float: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

/* 跟随系统亮色模式 */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-bg-primary: oklch(98% 0.008 85);
    --color-bg-secondary: oklch(95% 0.012 85);
    --color-bg-tertiary: oklch(92% 0.018 85);
    --color-bg-overlay: oklch(0% 0 0 / 0.4);
    --color-card-bg: oklch(99.5% 0.003 85);
    --color-card-bg-hover: oklch(99% 0.005 85);
    --color-text-primary: oklch(22% 0.015 85);
    --color-text-secondary: oklch(45% 0.02 85);
    --color-text-tertiary: oklch(62% 0.015 85);
    --color-text-inverse: oklch(99% 0.003 85);
    --color-accent-primary: oklch(52% 0.12 132);
    --color-accent-secondary: oklch(60% 0.15 45);
    --color-accent-muted: oklch(78% 0.06 132);
    --color-accent-hover: oklch(46% 0.11 132);
    --color-success: oklch(58% 0.14 145);
    --color-warning: oklch(72% 0.16 80);
    --color-error: oklch(52% 0.18 25);
    --color-info: oklch(52% 0.14 230);
    --color-border-primary: oklch(85% 0.02 85);
    --color-border-secondary: oklch(90% 0.015 85);
    --color-border-focus: oklch(52% 0.12 132);
    --color-border-accent: oklch(52% 0.12 132);
    --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.04), 0 1px 1px oklch(0% 0 0 / 0.02);
    --shadow-md: 0 2px 4px oklch(0% 0 0 / 0.04), 0 4px 8px oklch(0% 0 0 / 0.05), 0 1px 2px oklch(0% 0 0 / 0.02);
    --shadow-lg: 0 4px 8px oklch(0% 0 0 / 0.04), 0 12px 24px oklch(0% 0 0 / 0.07), 0 2px 4px oklch(0% 0 0 / 0.03);
    --shadow-xl: 0 8px 16px oklch(0% 0 0 / 0.06), 0 24px 48px oklch(0% 0 0 / 0.1), 0 4px 8px oklch(0% 0 0 / 0.04);
    --shadow-card: 0 2px 4px oklch(0% 0 0 / 0.03), 0 8px 16px oklch(0% 0 0 / 0.05), 0 1px 3px oklch(0% 0 0 / 0.02);
    --shadow-card-hover: 0 4px 8px oklch(0% 0 0 / 0.04), 0 16px 32px oklch(0% 0 0 / 0.08), 0 2px 6px oklch(0% 0 0 / 0.03);
    --shadow-floating: 0 8px 32px oklch(0% 0 0 / 0.08), 0 24px 48px oklch(0% 0 0 / 0.1), 0 4px 12px oklch(0% 0 0 / 0.04);
    --glass-bg: oklch(99% 0.005 85 / 0.92);
    --glass-bg-subtle: oklch(97% 0.008 85 / 0.88);
    --glass-bg-hover: oklch(95% 0.012 85 / 0.92);
    --glass-bg-active: oklch(93% 0.015 85 / 0.9);
    --glass-border: oklch(85% 0.02 85 / 0.7);
    --glass-border-subtle: oklch(90% 0.015 85 / 0.5);
    --glass-border-focus: oklch(52% 0.12 132 / 0.5);
    --glass-blur: blur(16px);
    --glass-blur-xl: blur(24px);
    --glass-shadow: 0 2px 8px oklch(0% 0 0 / 0.06);
    --glass-shadow-lg: 0 8px 32px oklch(0% 0 0 / 0.1);
    --glass-shadow-inset: inset 0 1px 0 oklch(100% 0 0 / 0.8);
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-2xl: 32px;
    --gradient-primary: linear-gradient(135deg, oklch(52% 0.12 132), oklch(46% 0.11 145));
    --gradient-accent: linear-gradient(135deg, oklch(52% 0.12 132), oklch(60% 0.15 45));
    --gradient-subtle: linear-gradient(135deg, oklch(97% 0.005 85), oklch(95% 0.008 85));
    --gradient-card-bg: linear-gradient(180deg, oklch(99.5% 0.003 85), oklch(99% 0.004 85));
    --mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(96% 0.01 132 / 0.4) 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 20%, oklch(95% 0.015 45 / 0.3) 0%, transparent 50%),
                     radial-gradient(ellipse at 50% 80%, oklch(97% 0.008 85 / 0.35) 0%, transparent 50%);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-paper: cubic-bezier(0.25, 0.1, 0.25, 1.0);
    --ease-float: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --duration-instant: 100ms;
    --duration-fast: 200ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
  }
}
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds with new CSS variables

- [ ] **Step 3: 提交**

```bash
git add src/styles/themes/light.css
git commit -m "style(paper-garden): 重写亮色主题为暖色调 — 橄榄绿强调色 + 纸张阴影"
```

---

### Task 2: 重写暗色主题 CSS 变量

**Files:**
- Modify: `src/styles/themes/dark.css`

- [ ] **Step 1: 重写暗色主题变量**

将 `src/styles/themes/dark.css` 中 `[data-theme="dark"], :root:not([data-theme])` 和 `@media (prefers-color-scheme: dark)` 块内的所有变量替换为新值：

```css
/**
 * 暗色主题 CSS 变量定义
 * Paper Garden — 深暖灰底色 + 亮橄榄绿强调色
 */

[data-theme="dark"],
:root:not([data-theme]) {
  /* === 背景色 — 深暖灰，非冷蓝 === */
  --color-bg-primary: oklch(14% 0.03 90);
  --color-bg-secondary: oklch(18% 0.035 90);
  --color-bg-tertiary: oklch(22% 0.04 90);
  --color-bg-overlay: oklch(0% 0 0 / 0.7);

  /* === 卡片层 === */
  --color-card-bg: oklch(18% 0.035 90);
  --color-card-bg-hover: oklch(22% 0.04 90);

  /* === 文本色 — 暖白 === */
  --color-text-primary: oklch(92% 0.01 85);
  --color-text-secondary: oklch(75% 0.015 85);
  --color-text-tertiary: oklch(60% 0.012 85);
  --color-text-inverse: oklch(14% 0.03 90);

  /* === 强调色 — 亮橄榄绿 + 暖陶土 === */
  --color-accent-primary: oklch(62% 0.14 132);
  --color-accent-secondary: oklch(68% 0.16 50);
  --color-accent-muted: oklch(50% 0.1 132);
  --color-accent-hover: oklch(68% 0.15 132);

  /* === 语义色 === */
  --color-success: oklch(64% 0.16 145);
  --color-warning: oklch(75% 0.16 80);
  --color-error: oklch(58% 0.2 25);
  --color-info: oklch(64% 0.16 230);

  /* === 边框色 === */
  --color-border-primary: oklch(32% 0.04 90);
  --color-border-secondary: oklch(26% 0.035 90);
  --color-border-focus: oklch(62% 0.14 132);
  --color-border-accent: oklch(62% 0.14 132);

  /* === 阴影 — 深色柔和阴影 === */
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3);
  --shadow-md: 0 2px 4px oklch(0% 0 0 / 0.35), 0 4px 8px oklch(0% 0 0 / 0.25);
  --shadow-lg: 0 4px 8px oklch(0% 0 0 / 0.4), 0 12px 24px oklch(0% 0 0 / 0.3);
  --shadow-xl: 0 8px 16px oklch(0% 0 0 / 0.45), 0 24px 48px oklch(0% 0 0 / 0.35);

  /* === 卡片阴影 === */
  --shadow-card: 0 2px 4px oklch(0% 0 0 / 0.3),
                 0 8px 16px oklch(0% 0 0 / 0.25),
                 0 1px 3px oklch(0% 0 0 / 0.15);
  --shadow-card-hover: 0 4px 8px oklch(0% 0 0 / 0.35),
                       0 16px 32px oklch(0% 0 0 / 0.3),
                       0 2px 6px oklch(0% 0 0 / 0.2);
  --shadow-floating: 0 8px 32px oklch(0% 0 0 / 0.4),
                     0 24px 48px oklch(0% 0 0 / 0.35),
                     0 4px 12px oklch(0% 0 0 / 0.25);

  /* === 玻璃拟态 — 深暖灰 === */
  --glass-bg: oklch(18% 0.035 90 / 0.92);
  --glass-bg-subtle: oklch(22% 0.04 90 / 0.88);
  --glass-bg-hover: oklch(26% 0.045 90 / 0.92);
  --glass-bg-active: oklch(30% 0.06 90 / 0.9);
  --glass-border: oklch(32% 0.04 90 / 0.65);
  --glass-border-subtle: oklch(28% 0.035 90 / 0.5);
  --glass-border-focus: oklch(62% 0.14 132 / 0.5);
  --glass-blur: blur(16px);
  --glass-blur-xl: blur(24px);
  --glass-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
  --glass-shadow-lg: 0 8px 32px oklch(0% 0 0 / 0.4);
  --glass-shadow-inset: inset 0 1px 0 oklch(100% 0 0 / 0.06);

  /* === 圆角 === */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-2xl: 32px;

  /* === 渐变 === */
  --gradient-primary: linear-gradient(135deg, oklch(62% 0.14 132), oklch(55% 0.12 145));
  --gradient-accent: linear-gradient(135deg, oklch(62% 0.14 132), oklch(68% 0.16 50));
  --gradient-subtle: linear-gradient(135deg, oklch(18% 0.035 90), oklch(22% 0.04 90));
  --gradient-card-bg: linear-gradient(180deg, oklch(18% 0.035 90), oklch(16% 0.035 90));
  --mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(24% 0.06 132 / 0.25) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 20%, oklch(26% 0.07 50 / 0.2) 0%, transparent 50%),
                   radial-gradient(ellipse at 50% 80%, oklch(20% 0.04 90 / 0.2) 0%, transparent 50%);

  /* === 动画 === */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-paper: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-float: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

/* 跟随系统暗色模式 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-bg-primary: oklch(14% 0.03 90);
    --color-bg-secondary: oklch(18% 0.035 90);
    --color-bg-tertiary: oklch(22% 0.04 90);
    --color-bg-overlay: oklch(0% 0 0 / 0.7);
    --color-card-bg: oklch(18% 0.035 90);
    --color-card-bg-hover: oklch(22% 0.04 90);
    --color-text-primary: oklch(92% 0.01 85);
    --color-text-secondary: oklch(75% 0.015 85);
    --color-text-tertiary: oklch(60% 0.012 85);
    --color-text-inverse: oklch(14% 0.03 90);
    --color-accent-primary: oklch(62% 0.14 132);
    --color-accent-secondary: oklch(68% 0.16 50);
    --color-accent-muted: oklch(50% 0.1 132);
    --color-accent-hover: oklch(68% 0.15 132);
    --color-success: oklch(64% 0.16 145);
    --color-warning: oklch(75% 0.16 80);
    --color-error: oklch(58% 0.2 25);
    --color-info: oklch(64% 0.16 230);
    --color-border-primary: oklch(32% 0.04 90);
    --color-border-secondary: oklch(26% 0.035 90);
    --color-border-focus: oklch(62% 0.14 132);
    --color-border-accent: oklch(62% 0.14 132);
    --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3);
    --shadow-md: 0 2px 4px oklch(0% 0 0 / 0.35), 0 4px 8px oklch(0% 0 0 / 0.25);
    --shadow-lg: 0 4px 8px oklch(0% 0 0 / 0.4), 0 12px 24px oklch(0% 0 0 / 0.3);
    --shadow-xl: 0 8px 16px oklch(0% 0 0 / 0.45), 0 24px 48px oklch(0% 0 0 / 0.35);
    --shadow-card: 0 2px 4px oklch(0% 0 0 / 0.3), 0 8px 16px oklch(0% 0 0 / 0.25), 0 1px 3px oklch(0% 0 0 / 0.15);
    --shadow-card-hover: 0 4px 8px oklch(0% 0 0 / 0.35), 0 16px 32px oklch(0% 0 0 / 0.3), 0 2px 6px oklch(0% 0 0 / 0.2);
    --shadow-floating: 0 8px 32px oklch(0% 0 0 / 0.4), 0 24px 48px oklch(0% 0 0 / 0.35), 0 4px 12px oklch(0% 0 0 / 0.25);
    --glass-bg: oklch(18% 0.035 90 / 0.92);
    --glass-bg-subtle: oklch(22% 0.04 90 / 0.88);
    --glass-bg-hover: oklch(26% 0.045 90 / 0.92);
    --glass-bg-active: oklch(30% 0.06 90 / 0.9);
    --glass-border: oklch(32% 0.04 90 / 0.65);
    --glass-border-subtle: oklch(28% 0.035 90 / 0.5);
    --glass-border-focus: oklch(62% 0.14 132 / 0.5);
    --glass-blur: blur(16px);
    --glass-blur-xl: blur(24px);
    --glass-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
    --glass-shadow-lg: 0 8px 32px oklch(0% 0 0 / 0.4);
    --glass-shadow-inset: inset 0 1px 0 oklch(100% 0 0 / 0.06);
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-2xl: 32px;
    --gradient-primary: linear-gradient(135deg, oklch(62% 0.14 132), oklch(55% 0.12 145));
    --gradient-accent: linear-gradient(135deg, oklch(62% 0.14 132), oklch(68% 0.16 50));
    --gradient-subtle: linear-gradient(135deg, oklch(18% 0.035 90), oklch(22% 0.04 90));
    --gradient-card-bg: linear-gradient(180deg, oklch(18% 0.035 90), oklch(16% 0.035 90));
    --mesh-gradient: radial-gradient(ellipse at 20% 50%, oklch(24% 0.06 132 / 0.25) 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 20%, oklch(26% 0.07 50 / 0.2) 0%, transparent 50%),
                     radial-gradient(ellipse at 50% 80%, oklch(20% 0.04 90 / 0.2) 0%, transparent 50%);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-paper: cubic-bezier(0.25, 0.1, 0.25, 1.0);
    --ease-float: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --duration-instant: 100ms;
    --duration-fast: 200ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
  }
}
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/styles/themes/dark.css
git commit -m "style(paper-garden): 重写暗色主题为深暖灰 + 亮橄榄绿"
```

---

### Task 3: 更新 global.css — 纸张阴影 + 移除 Glassmorphism

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: 更新 `.glass-card` 类定义**

将 `.glass-card` 的 CSS 替换为纸张风格（移除 backdrop-filter blur）：

```css
  .glass-card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    transition: transform var(--duration-normal) var(--ease-spring),
                box-shadow var(--duration-normal) var(--ease-smooth);
  }

  .glass-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
  }
```

注意：保留 `backdrop-filter` 仅在 `.glass` 和 `.glass-subtle` 类上（用于顶部栏），`.glass-card` 变为实色纸张卡片。

- [ ] **Step 2: 更新 `.page-content` 动画为 `ease-paper`**

```css
  .page-content {
    animation: fade-in-up var(--duration-normal) var(--ease-paper);
  }
```

- [ ] **Step 3: 添加侧边栏书脊样式**

在 `global.css` 底部添加：

```css
/* 侧边栏书脊 — Paper Garden */
.sidebar-spine {
  position: fixed;
  top: 0;
  left: 0;
  width: 4px;
  height: 100vh;
  background: linear-gradient(180deg, var(--color-accent-primary), var(--color-accent-muted));
  z-index: 100;
  transition: width var(--duration-slow) var(--ease-float);
  cursor: pointer;
}

.sidebar-spine::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-smooth);
}

.sidebar-spine:hover::after {
  opacity: 1;
}
```

- [ ] **Step 4: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 5: 提交**

```bash
git add src/styles/global.css
git commit -m "style(paper-garden): 更新 glass-card 为纸张风格 + 添加书脊样式"
```

---

### Task 4: 更新 Sidebar Store — 添加固定状态

**Files:**
- Modify: `src/admin/stores/sidebar.store.ts`

- [ ] **Step 1: 添加 pinned 状态**

```ts
/**
 * @fileoverview 侧边栏状态管理 — Paper Garden
 * @description 管理侧边栏折叠/展开/固定状态，localStorage 持久化
 */

import { create } from 'zustand';

const STORAGE_KEY = 'sidebar-state';

interface SidebarState {
  collapsed: boolean;
  pinned: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  setPinned: (value: boolean) => void;
  togglePinned: () => void;
}

function getInitialState(): { collapsed: boolean; pinned: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch {
    // SSR 环境
  }
  return { collapsed: false, pinned: false };
}

export const useSidebarStore = create<SidebarState>((set) => {
  const initial = getInitialState();
  return {
    collapsed: initial.collapsed,
    pinned: initial.pinned,
    toggle: () =>
      set((state) => {
        const next = !state.collapsed;
        const newState = { ...state, collapsed: next };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: next, pinned: state.pinned }));
        } catch {
          // localStorage 不可用，忽略
        }
        return newState;
      }),
    setCollapsed: (value) =>
      set((state) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: value, pinned: state.pinned }));
        } catch {
          // localStorage 不可用，忽略
        }
        return { collapsed: value };
      }),
    setPinned: (value) =>
      set((state) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: !value, pinned: value }));
        } catch {
          // localStorage 不可用，忽略
        }
        return { pinned: value, collapsed: !value };
      }),
    togglePinned: () =>
      set((state) => {
        const next = !state.pinned;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: next, pinned: next ? false : true }));
        } catch {
          // localStorage 不可用，忽略
        }
        return { pinned: next, collapsed: next ? false : true };
      }),
  };
});
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/admin/stores/sidebar.store.ts
git commit -m "feat(paper-garden): 更新 sidebar store — 添加 pinned 状态"
```

---

### Task 5: 重构 Sidebar — 书脊式浮动面板

**Files:**
- Modify: `src/admin/components/layout/Sidebar.tsx`

- [ ] **Step 1: 重写 Sidebar 组件**

将 `Sidebar.tsx` 完全重写为"书脊"式浮动面板：

```tsx
/**
 * @fileoverview Paper Garden 侧边栏 — 书脊式浮动面板
 * @description 默认收起为 4px 橄榄绿渐变线（书脊），悬停/点击展开为 260px 浮动面板
 * 支持固定模式（点击图钉）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, Pin, PinOff, LayoutDashboard, FileText, Tag, FolderOpen, Image, Settings, Users, ScrollText, PageText } from 'lucide-react';
import { useSidebarStore } from '../../stores/sidebar.store';
import { navItems } from '../../config/navigation';

export function Sidebar() {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(!collapsed);
  const [activeItem, setActiveItem] = useState('');
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 当前页面高亮
  useEffect(() => {
    const path = window.location.pathname;
    const match = navItems.find((item) => path.startsWith(item.dataPath));
    if (match) setActiveItem(match.href);
  }, []);

  // 展开/收起动画延迟
  const handleMouseEnter = useCallback(() => {
    if (isPinned) return;
    hoverTimerRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 150);
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (!isPinned) {
      setIsExpanded(false);
    }
  }, [isPinned]);

  const handleSpineClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handlePinToggle = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      setCollapsed(!next);
      return next;
    });
  }, [setCollapsed]);

  const isShowing = isPinned || isExpanded;
  const sidebarWidth = isShowing ? 260 : 0;

  return (
    <>
      {/* 书脊 — 始终可见的 4px 渐变线 */}
      {!isPinned && (
        <div
          className="sidebar-spine"
          onClick={handleSpineClick}
          onMouseEnter={handleMouseEnter}
        />
      )}

      {/* 侧边栏面板 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col border-r border-border-secondary bg-card-bg transition-all duration-500 ease-float overflow-hidden ${
          isShowing ? 'rounded-r-[var(--radius-xl)] shadow-floating' : ''
        }`}
        style={{
          width: `${sidebarWidth}px`,
          transform: isShowing ? 'translateX(0)' : 'translateX(-100%)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        id="admin-sidebar"
      >
        {isShowing && (
          <>
            {/* Logo 区域 */}
            <div className="flex h-16 items-center justify-between border-b border-border-secondary px-5 shrink-0">
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                Paper Garden
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePinToggle}
                  className="p-1.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                  aria-label={isPinned ? '取消固定' : '固定侧边栏'}
                  title={isPinned ? '取消固定' : '固定侧边栏'}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </button>
                {!isPinned && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                    aria-label="收起侧栏"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 导航菜单 */}
            <nav className="mt-3 space-y-1 px-3 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast ${
                      isActive
                        ? 'bg-card-bg text-accent-primary border-l-[3px] border-accent-primary shadow-sm'
                        : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary border-l-[3px] border-transparent'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* 底部信息 */}
            <div className="border-t border-border-secondary px-5 py-3 text-xs text-text-tertiary">
              <span>Admin CMS v1.0</span>
            </div>
          </>
        )}
      </aside>

      {/* 主内容区偏移 */}
      <div
        className="transition-all duration-500 ease-float"
        style={{ marginLeft: isPinned ? '260px' : '0px' }}
      />
    </>
  );
}

export default Sidebar;
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/admin/components/layout/Sidebar.tsx
git commit -m "feat(paper-garden): 重构 Sidebar 为书脊式浮动面板"
```

---

### Task 6: 更新 AdminLayout.astro — 移除 mesh-bg，更新顶部栏

**Files:**
- Modify: `src/layouts/AdminLayout.astro`

- [ ] **Step 1: 更新 AdminLayout.astro**

替换 body 和 header 的样式：

```astro
---
/**
 * @fileoverview 后台管理布局 — Paper Garden
 * @description 书脊式侧边栏 + 暖色调顶部栏
 */
import '../styles/global.css';
import SidebarMount from '@admin/components/layout/SidebarMount.astro';
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin CMS</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body class="h-screen overflow-hidden bg-bg-primary">
    <div class="flex h-screen">
      <!-- 侧边栏 — React 组件渲染 -->
      <SidebarMount />

      <!-- 主内容区 -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- 头部 -->
        <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border-secondary bg-glass-bg/80 backdrop-blur-md px-6">
          <h2 class="text-lg font-semibold text-text-primary"><slot name="page-title" /></h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-secondary" id="admin-username"></span>
            <button id="logout-btn" class="rounded-md bg-error/80 px-4 py-2 text-sm text-white transition-all duration-normal hover:bg-error hover:scale-[1.02]">
              退出登录
            </button>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="flex-1 min-h-0 overflow-auto p-6 page-content">
          <slot />
        </main>
      </div>
    </div>

    <script>
      async function checkAuth() {
        try {
          const res = await fetch('/api/admin/auth/me');
          if (!res.ok) {
            window.location.href = '/admin';
            return;
          }
          const json = await res.json();
          const usernameEl = document.getElementById('admin-username');
          if (usernameEl && json.data) {
            usernameEl.textContent = json.data.username;
          }
        } catch {
          window.location.href = '/admin';
        }
      }

      const logoutBtn = document.getElementById('logout-btn');
      logoutBtn?.addEventListener('click', async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin';
      });

      checkAuth();
    </script>
  </body>
</html>
```

关键变化：
- `body`: `mesh-bg` → `bg-bg-primary`（暖白底）
- `header`: `bg-glass-bg` → `bg-glass-bg/80 backdrop-blur-md`（保留毛玻璃但更轻盈）
- `header border`: `border-glass-border` → `border-border-secondary`（更柔和）
- `main`: 移除 `glass-scrollbar`，使用默认滚动条
- 退出按钮：移除 `backdrop-blur`

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/layouts/AdminLayout.astro
git commit -m "style(paper-garden): 更新 AdminLayout — 移除 mesh-bg，简化顶部栏"
```

---

### Task 7: 更新 Button 和 Input 组件

**Files:**
- Modify: `src/admin/components/common/Button.tsx`
- Modify: `src/admin/components/common/Input.tsx`

- [ ] **Step 1: 更新 Button.tsx**

```tsx
/**
 * @fileoverview 按钮组件 — Paper Garden
 * @description 通用按钮组件，支持多种变体和尺寸
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-fast ease-smooth focus:outline-none focus:ring-2 focus:ring-accent-primary/50';

  const variantClasses = {
    primary: 'text-white shadow-sm hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm',
    secondary: 'bg-card-bg text-text-primary border-2 border-border-primary hover:border-accent-primary/50 hover:bg-bg-secondary hover:-translate-y-[1px]',
    danger: 'bg-error text-white hover:-translate-y-[1px] hover:shadow-md active:translate-y-0',
    ghost: 'text-text-secondary hover:bg-bg-secondary hover:text-accent-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const primaryStyle = variant === 'primary'
    ? {
        background: 'var(--gradient-primary)',
        backgroundColor: 'var(--color-accent-primary)',
        color: '#fff',
      }
    : undefined;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''} ${className}`}
      style={primaryStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
```

关键变化：
- 移除 `backdrop-blur`、`shadow-glass`、`scale-[1.02]`
- 新增 `-translate-y-[1px]` 上浮效果 + 按下回弹
- 移除 `duration-normal ease-spring`，改为 `duration-fast ease-smooth`
- 移除 `rounded-md` 外的圆角变化

- [ ] **Step 2: 更新 Input.tsx**

```tsx
/**
 * @fileoverview 输入框组件 — Paper Garden
 * @description 通用文本输入框，支持标签、错误提示
 */

import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-md border-2 border-border-secondary bg-bg-tertiary px-3 py-2 text-text-primary placeholder-text-tertiary transition-all duration-fast ease-smooth focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${sizeClasses[size]} ${error ? 'border-error focus:border-error focus:ring-error/30' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
```

关键变化：
- `border` → `border-2`（更粗边框，更温暖）
- `border-glass-border` → `border-border-secondary`
- `bg-glass-bg-subtle` → `bg-bg-tertiary`
- 移除 `backdrop-blur`

- [ ] **Step 3: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: 提交**

```bash
git add src/admin/components/common/Button.tsx src/admin/components/common/Input.tsx
git commit -m "style(paper-garden): 更新 Button 和 Input — 移除毛玻璃，纸张风格"
```

---

### Task 8: 更新 Dashboard 页面 — 统计卡片颜色映射

**Files:**
- Modify: `src/admin/pages/dashboard.tsx`

- [ ] **Step 1: 更新 Dashboard 颜色映射**

将 `colorMap` 从六色冷调改为自然色调：

```tsx
const colorMap: Record<string, { gradient: string; text: string; dot: string }> = {
  olive: {
    gradient: 'from-accent-primary/20 to-accent-primary/5',
    text: 'text-accent-primary',
    dot: 'bg-accent-primary',
  },
  terracotta: {
    gradient: 'from-accent-secondary/20 to-accent-secondary/5',
    text: 'text-accent-secondary',
    dot: 'bg-accent-secondary',
  },
  green: {
    gradient: 'from-success/20 to-success/5',
    text: 'text-success',
    dot: 'bg-success',
  },
  amber: {
    gradient: 'from-warning/20 to-warning/5',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  info: {
    gradient: 'from-info/20 to-info/5',
    text: 'text-info',
    dot: 'bg-info',
  },
};

// statCards 颜色映射
const statCards = [
  { label: '总文章', value: stats?.totalPosts ?? 0, color: 'olive', span: 'col-span-2' },
  { label: '已发布', value: stats?.publishedPosts ?? 0, color: 'green', span: '' },
  { label: '草稿', value: stats?.draftPosts ?? 0, color: 'amber', span: '' },
  { label: '分类', value: stats?.totalCategories ?? 0, color: 'terracotta', span: '' },
  { label: '标签', value: stats?.totalTags ?? 0, color: 'info', span: '' },
  { label: '媒体文件', value: stats?.totalMedia ?? 0, color: 'olive', span: '' },
];
```

同时将 `glass-card` 和 `divide-glass-border` 改为新风格（CSS 类定义已更新，此处仅需确保类名正确）。

- [ ] **Step 2: 更新 Dashboard 间距**

将 Bento Grid 间距从 `gap-4` 改为 `gap-6`：

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-7">
```

- [ ] **Step 3: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: 提交**

```bash
git add src/admin/pages/dashboard.tsx
git commit -m "style(paper-garden): 更新 Dashboard — 橄榄绿/陶土橙颜色映射 + 更大间距"
```

---

### Task 9: 更新 Outline 组件和 TabBar

**Files:**
- Modify: `src/admin/components/common/Outline.tsx`
- Modify: `src/admin/components/editor/TabBar.tsx`（如果存在）

- [ ] **Step 1: 更新 Outline.tsx**

```tsx
// 将 glass-card 的 rounded-xl 改为 rounded-lg（对应 20px）
// 将 hover:bg-glass-bg-hover 改为 hover:bg-bg-secondary
// 将活跃状态从 bg-accent-primary/15 改为 bg-accent-primary/10 border-l-2 border-accent-primary
```

完整更新：

```tsx
/**
 * @fileoverview 大纲组件 — Paper Garden
 * @description 从 HTML 内容中提取标题层级并展示
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ListTree } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface OutlineProps {
  content: string;
  activeId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

/** 从 TipTap 生成的 HTML 中提取标题大纲 */
export function extractToc(content: string): TocItem[] {
  if (!content) return [];

  const items: TocItem[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');

  headings.forEach((heading, index) => {
    const id = heading.id || `heading-${index}`;
    if (!heading.id) {
      heading.id = id;
    }
    items.push({
      id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    });
  });

  return items;
}

/** 大纲侧边栏组件 */
export function Outline({ content, activeId, onNavigate, className = '' }: OutlineProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setItems(extractToc(content));
  }, [content]);

  const handleItemClick = useCallback(
    (id: string) => {
      if (onNavigate) {
        onNavigate(id);
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [onNavigate]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-border-secondary bg-card-bg p-4 shadow-sm ${className}`}>
      <div className="flex shrink-0 items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-text-secondary" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-text-primary">文章大纲</h3>
          <span className="text-xs text-text-tertiary">{items.length} 个标题</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
        >
          <ChevronRight
            className={`h-4 w-4 text-text-tertiary transition-transform duration-fast ${
              collapsed ? '' : 'rotate-90'
            }`}
          />
        </button>
      </div>

      {!collapsed && (
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const indent = (item.level - 1) * 12;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left rounded-md py-1.5 px-2 transition-colors truncate ${
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary font-medium border-l-2 border-accent-primary'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
                style={{
                  paddingLeft: `${12 + indent}px`,
                  fontSize: item.level === 1 ? '14px' : item.level === 2 ? '13px' : '12px',
                }}
                title={item.text}
              >
                <span className="inline-block w-4 text-text-tertiary/50 text-xs mr-1">
                  {item.level === 1 ? '●' : item.level === 2 ? '○' : '·'}
                </span>
                {item.text}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default Outline;
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/admin/components/common/Outline.tsx
git commit -m "style(paper-garden): 更新 Outline — 纸张卡片风格 + 橄榄绿活跃状态"
```

---

### Task 10: 更新剩余页面组件 — 显式类名替换

**Files:**
- Modify: `src/admin/components/editor/Editor.tsx`
- Modify: `src/admin/components/editor/SettingsDrawer.tsx`
- Modify: `src/admin/components/editor/TableOfContents.tsx`
- Modify: `src/admin/components/media/MediaPicker.tsx`
- Modify: `src/admin/pages/settings.tsx`
- Modify: `src/admin/pages/posts/index.tsx`
- Modify: `src/admin/pages/users.tsx`
- Modify: `src/admin/pages/media.tsx`

**策略**：这些文件中的 `glass-card`、`bg-glass-bg` 等类名会通过 CSS 变量自动继承新值。但需要显式更新以下问题：

- [ ] **Step 1: Editor.tsx — 移除冗余 `shadow-glass`**

```tsx
// 将:
// <div className="relative rounded-xl overflow-hidden glass-card shadow-glass-lg">
// 改为:
<div className="relative rounded-xl overflow-hidden glass-card">

// 将:
// className="flex items-center gap-0.5 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur px-1.5 py-1 shadow-glass animate-in"
// 改为:
className="flex items-center gap-0.5 rounded-xl border border-border-secondary bg-bg-secondary px-1.5 py-1 animate-in"

// 将:
// className="flex flex-col gap-0.5 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-1.5 shadow-glass animate-in"
// 改为:
className="flex flex-col gap-0.5 rounded-xl border border-border-secondary bg-bg-secondary p-1.5 animate-in"
```

- [ ] **Step 2: MediaPicker.tsx — 移除 `shadow-glass` 和 `hover:scale-[1.02]`**

```tsx
// 将:
// className="rounded-md px-4 py-2 text-white shadow-glass shadow-sm transition-all duration-normal ease-spring hover:scale-[1.02]"
// 改为:
className="rounded-md px-4 py-2 text-white shadow-sm transition-all duration-fast ease-smooth hover:-translate-y-[1px] hover:shadow-md"
```

- [ ] **Step 3: settings.tsx — 移除 `shadow-glass` 和 `hover:scale-[1.02]`**

```tsx
// 将:
// className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-glass shadow-sm hover:scale-[1.02] transition-all duration-normal ease-spring"
// 改为:
className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
```

- [ ] **Step 4: users.tsx — 移除 `shadow-glass` 和 `hover:scale-[1.02]`**

```tsx
// 将:
// className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-glass shadow-sm hover:scale-[1.02] transition-all duration-normal ease-spring"
// 改为:
className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
```

- [ ] **Step 5: posts/index.tsx — 更新 filter 按钮活跃状态**

```tsx
// 将:
// const filterBtnActive = 'bg-glass-bg-active text-accent-primary border-2 border-accent-primary/50';
// 改为:
const filterBtnActive = 'bg-bg-secondary text-accent-primary border-2 border-accent-primary/50';
```

- [ ] **Step 6: media.tsx — 更新视图切换按钮**

```tsx
// 将 bg-glass-bg-active → bg-bg-secondary
// 将 hover:bg-glass-bg-hover → hover:bg-bg-secondary
// 这些 Tailwind 类通过 CSS 变量映射已更新，保持类名不变也可继承新值
```

- [ ] **Step 7: SettingsDrawer.tsx 和 TableOfContents.tsx**

这些文件中若有 `glass-card` 或 `shadow-glass` 类，移除 `shadow-glass`（`glass-card` 已自带阴影）。

- [ ] **Step 8: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 9: 提交**

```bash
git add src/admin/components/editor/Editor.tsx src/admin/components/editor/SettingsDrawer.tsx src/admin/components/editor/TableOfContents.tsx src/admin/components/media/MediaPicker.tsx src/admin/pages/settings.tsx src/admin/pages/posts/index.tsx src/admin/pages/users.tsx src/admin/pages/media.tsx
git commit -m "style(paper-garden): 更新剩余页面组件 — 移除 shadow-glass，简化过渡效果"
```

---

### Task 11: 删除废弃的 AdminLayout.tsx React 组件

**Files:**
- Delete: `src/admin/components/layout/AdminLayout.tsx`

- [ ] **Step 1: 删除废弃文件**

该文件顶部已标注 `@deprecated`，且所有管理页面使用 `AdminLayout.astro`。

Run:
```bash
git rm src/admin/components/layout/AdminLayout.tsx
```

- [ ] **Step 2: 验证无引用**

Run:
```bash
grep -rn "from.*AdminLayout" src/admin/ --include="*.tsx" --include="*.ts"
```
Expected: 无结果（仅剩 `.astro` 文件中的引用）

- [ ] **Step 3: 提交**

```bash
git commit -m "chore(paper-garden): 删除废弃的 React AdminLayout 组件"
```

---

### Task 12: 全局替换 mesh-bg 和冗余类名

**Files:**
- Modify: `src/admin/pages/login.tsx`

**策略**：由于 `.glass-card` 在 global.css 中已更新为纸张风格，页面会自动继承新样式。但需要替换以下特定类名：

- [ ] **Step 1: `mesh-bg` → `bg-bg-primary`**

在 `login.tsx` 中替换：
```tsx
// 将:
<div className="flex min-h-screen items-center justify-center mesh-bg">
// 改为:
<div className="flex min-h-screen items-center justify-center bg-bg-primary">
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/admin/pages/login.tsx
git commit -m "style(paper-garden): 替换 mesh-bg 为 bg-bg-primary"
```

---

### Task 13: 最终验证 + 构建测试

**Files:**
- All modified files

- [ ] **Step 1: 运行构建**

Run: `pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 2: 启动开发服务器验证**

Run: `pnpm dev`
Expected: Dev server starts, open http://localhost:4321/admin/dashboard

- [ ] **Step 3: 视觉验证清单**

打开浏览器后检查：
- [ ] 页面背景为暖白色（非冷蓝/冷白）
- [ ] 左侧有 4px 橄榄绿渐变书脊线
- [ ] 悬停书脊，侧边栏从左侧滑出（260px）
- [ ] 侧边栏右侧圆角，带浮动阴影
- [ ] 导航项活跃状态：纸张白底 + 左侧橄榄绿边框 + 阴影
- [ ] 统计卡片：暖白卡片 + 柔和阴影 + 橄榄绿/陶土橙颜色点
- [ ] Hover 卡片时上浮 2px + 阴影加深
- [ ] 按钮为渐变橄榄绿，点击有按下效果
- [ ] 输入框为 2px 边框，聚焦时边框变橄榄绿

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "style(paper-garden): 完成 CMS 后台纸花园重设计

- 重写亮色/暗色主题 CSS 变量为暖色调
- 更新 glass-card 为纸张风格（移除毛玻璃）
- 重构 Sidebar 为书脊式浮动面板
- 更新 AdminLayout、Button、Input、Outline 组件
- 更新 Dashboard 颜色映射为橄榄绿/陶土橙
- 删除废弃的 React AdminLayout 组件"
```

---

## 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/styles/themes/light.css` | 重写 | 暖白底色 + 橄榄绿强调色 |
| `src/styles/themes/dark.css` | 重写 | 深暖灰 + 亮橄榄绿 |
| `src/styles/global.css` | 修改 | 纸张卡片阴影 + 书脊样式 |
| `src/admin/components/layout/Sidebar.tsx` | 重写 | 书脊式浮动面板 |
| `src/layouts/AdminLayout.astro` | 修改 | 移除 mesh-bg，简化顶部栏 |
| `src/admin/components/common/Button.tsx` | 修改 | 移除毛玻璃，按压力感 |
| `src/admin/components/common/Input.tsx` | 修改 | 2px 边框，移除毛玻璃 |
| `src/admin/components/common/Outline.tsx` | 修改 | 纸张卡片风格 |
| `src/admin/components/editor/Editor.tsx` | 修改 | 移除冗余 shadow-glass |
| `src/admin/components/editor/SettingsDrawer.tsx` | 修改 | 移除冗余 shadow-glass |
| `src/admin/components/editor/TableOfContents.tsx` | 修改 | 移除冗余 shadow-glass |
| `src/admin/components/media/MediaPicker.tsx` | 修改 | 移除 shadow-glass，简化动效 |
| `src/admin/pages/dashboard.tsx` | 修改 | 颜色映射更新 |
| `src/admin/pages/login.tsx` | 修改 | mesh-bg → bg-bg-primary |
| `src/admin/pages/settings.tsx` | 修改 | 移除 shadow-glass |
| `src/admin/pages/posts/index.tsx` | 修改 | 更新 filter 按钮类 |
| `src/admin/pages/users.tsx` | 修改 | 移除 shadow-glass |
| `src/admin/pages/media.tsx` | 修改 | 更新视图切换按钮类 |
| `src/admin/stores/sidebar.store.ts` | 修改 | 添加 pinned 状态 |
| `src/admin/components/layout/AdminLayout.tsx` | 删除 | 已废弃 |
