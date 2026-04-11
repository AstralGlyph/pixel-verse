# 暗色主题对比度优化设计

**日期:** 2026-04-10
**作者:** Claude
**状态:** 待审批

---

## 背景

Blog 页面在桌面端暗色主题下，多个元素的文字对比度低于 WCAG AA 标准，影响可读性和无障碍体验。

### 问题分析

| 元素 | 当前值 | 当前对比度 | WCAG 要求 | 问题 |
|------|--------|-----------|-----------|------|
| 强调色 (链接/按钮) | `oklch(55% 0.32 260)` | ~3.2:1 | ≥ 4.5:1 | ❌ 不达标 |
| 三级文字 (时间/统计) | `oklch(58% 0.02 260)` | ~3.8:1 | ≥ 4.5:1 | ❌ 不达标 |
| 代码块边框 | `oklch(22% 0.06 260)` | 视觉不明显 | — | ⚠️ 边界不清 |
| 硬编码 Tailwind 类 | `bg-gray-100`, `text-gray-700` 等 | 在暗色下不变色 | — | ⚠️ 不跟随主题 |

### 根因

1. 暗色主题 `accent-primary` 明度过低 (55%)，在 `oklch(10%)` 背景上对比度不足
2. 部分 blog 页面使用硬编码 Tailwind 颜色类，未通过 CSS 变量适配主题
3. 代码块边框颜色过深，在暗色背景下不可见

---

## 方案

采用 **全局语义化修复 (方案 B)**：
1. 更新 dark.css 中所有相关 CSS 变量，提升明度至 WCAG 标准
2. 新增 accent-primary-hover 变量用于悬停状态
3. 将 blog 前台页面中的硬编码类替换为语义化 CSS 变量
4. 修复代码块边框对比度

**范围:** 仅 blog 前台，不涉及 Admin 后台

---

## 颜色规范

### 暗色主题变量更新

#### 强调色 — 薄荷绿方向

| 变量 | 当前值 | 新值 | 对比度 | WCAG 等级 |
|------|--------|------|--------|-----------|
| `--color-accent-primary` | `oklch(55% 0.32 260)` | `oklch(76% 0.18 155)` | ~8.1:1 | AAA |
| `--color-accent-secondary` (新增 hover) | `oklch(62% 0.3 270)` | `oklch(80% 0.16 150)` | ~9.5:1 | AAA |
| `--color-accent-muted` | `oklch(42% 0.18 260)` | `oklch(60% 0.15 155)` | ~5.8:1 | AA |
| `--color-accent-hover` (新增) | — | `oklch(82% 0.14 148)` | ~10.2:1 | AAA |

#### 文字颜色

| 变量 | 当前值 | 新值 | 对比度 | WCAG 等级 |
|------|--------|------|--------|-----------|
| `--color-text-tertiary` | `oklch(58% 0.02 260)` | `oklch(68% 0.02 260)` | ~5.5:1 | AA |

#### 边框颜色

| 变量 | 当前值 | 新值 | 说明 |
|------|--------|------|------|
| `--color-border-primary` | `oklch(28% 0.05 260)` | `oklch(35% 0.05 260)` | 更明显 |
| 代码块边框 | `oklch(22% 0.06 260)` | `oklch(35% 0.06 260)` | 边界清晰 |

### 亮色主题

不受影响，保持不变。

---

## 硬编码替换映射

### src/pages/blog/ssr/[slug].astro

| 行号 | 当前类 | 新类 |
|------|--------|------|
| 85 | `bg-blue-100 text-blue-700 hover:bg-blue-200` | `bg-bg-tertiary text-accent-primary border border-border-primary hover:border-accent-primary` |
| 93 | `bg-gray-100 text-gray-700 hover:bg-gray-200` | `bg-bg-tertiary text-text-secondary border border-border-primary hover:border-accent-primary` |
| 103 | `bg-gray-50` | `bg-bg-secondary` |

### src/pages/blog/ssr.astro

| 行号 | 当前类 | 新类 |
|------|--------|------|
| 59, 70 | `border-gray-300 hover:bg-gray-50` | `border-border-primary hover:bg-bg-tertiary` |
| 64 | `text-gray-600` | `text-text-tertiary` |

### src/pages/[...slug].astro

| 行号 | 当前类 | 新类 |
|------|--------|------|
| 50 | `bg-white text-gray-900` | `bg-bg-primary text-text-primary` |
| 53 | `text-gray-900` | `text-text-primary` |
| 55-56 | `text-gray-600 hover:text-gray-900` | `text-text-tertiary hover:text-text-primary` |
| 69 | `text-gray-500` | `text-text-tertiary` |

---

## 代码块边框修复

**文件:** `src/styles/typography.css`

- 暗色主题 `pre` 边框从 `oklch(22% 0.06 260)` 更新为 `oklch(35% 0.06 260)`
- 同步更新 fallback 颜色 `rgb(50, 50, 80)` → `rgb(65, 65, 95)`

---

## 错误处理

无功能性变更，不涉及错误处理。

---

## 测试

### 视觉回归测试

使用已有的 E2E 视觉回归测试覆盖 blog 页面暗色主题：

```bash
# 运行 blog 相关的视觉回归测试
pnpm test:e2e
```

### 手动验证清单

- [ ] 暗色模式下 blog 文章页链接 (薄荷绿色) 对比度达标
- [ ] 暗色模式下 blog 列表页筛选按钮对比度达标
- [ ] 暗色模式下三级文字 (时间/统计信息) 清晰可读
- [ ] 暗色模式下代码块边框边界清晰
- [ ] 亮色主题不受影响
- [ ] 切换主题后颜色正常切换
- [ ] 链接 hover 状态颜色变化明显

---

## 修改文件清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/styles/themes/dark.css` | 修改变量 + 新增变量 | accent 系列、text-tertiary、border-primary |
| `src/styles/typography.css` | 修改边框颜色 | 代码块边框对比度提升 |
| `src/pages/blog/ssr/[slug].astro` | 替换硬编码类 | 分类标签、标签、摘要 |
| `src/pages/blog/ssr.astro` | 替换硬编码类 | 筛选按钮、统计文字 |
| `src/pages/[...slug].astro` | 替换硬编码类 | 导航栏、背景、链接 |
