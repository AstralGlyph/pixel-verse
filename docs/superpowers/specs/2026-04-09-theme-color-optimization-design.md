# 设计文档：主题色彩体系优化 — 极光代码块与深空沉浸

**创建时间**: 2026-04-09
**状态**: 待审批

---

## 背景与目标

优化文章预览页面的亮色主题和暗色主题颜色搭配，使整体视觉效果更高级、更有科技感。当前存在的问题：

1. **代码块配色不协调** — 亮色和暗色主题下代码块都使用同样的深色背景（`oklch(16% 0.04 260)`），在亮色主题下突兀
2. **亮色主题科技感不足** — 背景纯冷白、文字纯灰，缺乏科技氛围
3. **暗色主题沉浸感不够** — 背景偏亮、文字纯白，代码块不是视觉焦点

---

## 设计决策

### 决策 1：代码块采用极光流动渐变

**选择**：纯 CSS 动态渐变背景，`background-size: 300% 300%` + `@keyframes` 缓慢流动。

**理由**：
- 零 JavaScript 开销，GPU 加速合成
- 与 Shiki 语法高亮无冲突（高亮颜色在渐变层之上渲染）
- 12 秒流动速度很慢，不干扰阅读
- 亮色和暗色主题各自独立配色，代码块融入各自主题

**替代方案**：
- Canvas 背景动画：效果更炫酷但需要 JS，增加资源开销，与 Shiki 可能冲突
- 静态渐变 + hover 动效：默认状态下极光感太弱

### 决策 2：亮色主题采用强科技风格

**选择**：背景加入明显蓝调，文字带蓝调色相，代码块作为视觉焦点。

**理由**：
- 整体色彩体系围绕色相 240-260° 构建，蓝调科技感一致
- 从纯灰改为蓝调灰，文字更有层次感和科技氛围
- 背景略加深，提升对比度

### 决策 3：暗色主题采用深空沉浸感

**选择**：背景加深至接近纯黑，文字改为冷蓝白，代码块成为最亮的视觉焦点。

**理由**：
- 更深背景营造宇宙深空般的沉浸感
- 冷蓝白文字在暗色下呈现微妙蓝调，不再单调
- 代码块极光渐变在深色背景上更突出

---

## 技术规格

### 3.1 极光流动动画

```css
@keyframes aurora-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**参数**：
- 动画持续时间：`12s`
- 缓动函数：`ease`
- 循环方式：`infinite`
- 渐变尺寸：`300% 300%`
- 渐变方向：`135deg`（左上到右下）

### 3.2 亮色主题代码块配色

| 元素 | 当前值 | 新值 |
|------|--------|------|
| 背景 | `oklch(16% 0.04 260)` | 四色极光渐变（浅蓝紫系） |
| 文字 | `oklch(92% 0 0)` | `oklch(18% 0 0)` |
| 边框 | `oklch(25% 0.06 260)` | `oklch(78% 0.06 260)` |

**渐变定义**：

```css
background: linear-gradient(
  135deg,
  oklch(88% 0.06 220),  /* 青蓝浅底 */
  oklch(86% 0.08 260),  /* 紫色浅底 */
  oklch(90% 0.05 240),  /* 靛蓝浅底 */
  oklch(88% 0.06 220)   /* 循环锚点 */
);
background-size: 300% 300%;
animation: aurora-flow 12s ease infinite;
```

### 3.3 暗色主题代码块配色

| 元素 | 当前值 | 新值 |
|------|--------|------|
| 背景 | `oklch(16% 0.04 260)` | 四色极光渐变（深蓝紫系） |
| 文字 | `oklch(92% 0 0)` | `oklch(94% 0.02 260)` |
| 边框 | `oklch(25% 0.06 260)` | `oklch(22% 0.06 260)` |

**渐变定义**：

```css
background: linear-gradient(
  135deg,
  oklch(12% 0.08 220),  /* 深青蓝 */
  oklch(10% 0.08 280),  /* 深紫 */
  oklch(14% 0.06 240),  /* 深靛蓝 */
  oklch(12% 0.08 220)   /* 循环锚点 */
);
background-size: 300% 300%;
animation: aurora-flow 12s ease infinite;
```

### 3.4 亮色主题正文配色

| CSS 变量 | 当前值 | 新值 | 说明 |
|----------|--------|------|------|
| `--color-bg-primary` | `oklch(94% 0.02 260)` | `oklch(92% 0.03 240)` | 背景略加深，色相改为正蓝 |
| `--color-bg-secondary` | `oklch(90% 0.025 260)` | `oklch(88% 0.04 240)` | 卡片/侧栏更深，饱和度提升 |
| `--color-bg-tertiary` | `oklch(86% 0.03 260)` | `oklch(84% 0.05 240)` | 行内代码背景 |
| `--color-text-primary` | `oklch(12% 0 0)` | `oklch(14% 0.02 260)` | 带蓝调的深灰 |
| `--color-text-secondary` | `oklch(32% 0 0)` | `oklch(34% 0.03 260)` | 带蓝调的中灰 |
| `--color-text-tertiary` | `oklch(48% 0 0)` | `oklch(50% 0.03 260)` | 带蓝调的浅灰 |

### 3.5 暗色主题正文配色

| CSS 变量 | 当前值 | 新值 | 说明 |
|----------|--------|------|------|
| `--color-bg-primary` | `oklch(14% 0.05 260)` | `oklch(10% 0.04 260)` | 更深的蓝黑 |
| `--color-bg-secondary` | `oklch(18% 0.05 260)` | `oklch(14% 0.04 260)` | 卡片更深 |
| `--color-bg-tertiary` | `oklch(22% 0.05 260)` | `oklch(18% 0.05 260)` | 行内代码背景 |
| `--color-text-primary` | `oklch(98% 0 0)` | `oklch(94% 0.02 260)` | 冷蓝白 |
| `--color-text-secondary` | `oklch(80% 0 0)` | `oklch(76% 0.02 260)` | 冷灰白 |
| `--color-text-tertiary` | `oklch(62% 0 0)` | `oklch(58% 0.02 260)` | 冷浅灰 |

### 3.6 关联主题变量

背景色变化需要同步更新以下依赖变量：

**亮色主题**：

| CSS 变量 | 当前值 | 新值 |
|----------|--------|------|
| `--glass-bg` | `oklch(98% 0.008 260 / 0.97)` | `oklch(96% 0.01 240 / 0.97)` |
| `--glass-bg-subtle` | `oklch(96% 0.012 260 / 0.93)` | `oklch(94% 0.015 240 / 0.93)` |
| `--glass-bg-hover` | `oklch(94% 0.018 260 / 0.97)` | `oklch(92% 0.02 240 / 0.97)` |
| `--glass-bg-active` | `oklch(90% 0.035 260 / 0.95)` | `oklch(88% 0.035 240 / 0.95)` |
| `--gradient-subtle` | 96%→94% | 94%→92% |
| `--gradient-card-bg` | 98%→96% | 96%→94% |
| `--mesh-gradient` | 82-88% | 80-86% |

**暗色主题**：

| CSS 变量 | 当前值 | 新值 |
|----------|--------|------|
| `--glass-bg` | `oklch(16% 0.05 260 / 0.95)` | `oklch(12% 0.04 260 / 0.95)` |
| `--glass-bg-subtle` | `oklch(20% 0.05 260 / 0.92)` | `oklch(16% 0.04 260 / 0.92)` |
| `--glass-bg-hover` | `oklch(24% 0.06 260 / 0.95)` | `oklch(20% 0.05 260 / 0.95)` |
| `--glass-bg-active` | `oklch(28% 0.12 260 / 0.93)` | `oklch(24% 0.1 260 / 0.93)` |
| `--gradient-subtle` | 18%→20% | 14%→16% |
| `--gradient-card-bg` | 20%→16% | 16%→12% |
| `--mesh-gradient` | 38-42% | 34-38% |

### 3.7 `prefers-color-scheme` 媒体查询

`light.css` 和 `dark.css` 中的 `@media (prefers-color-scheme: ...)` 块内变量需要同步更新，确保跟随系统时效果一致。

### 3.8 `typography.css` 代码块样式

移除 `!important` 硬编码的 RGB 值，改用 CSS 变量 + 渐变 + RGB fallback：

```css
/* 极光流动动画 */
@keyframes aurora-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.prose pre {
  /* 不支持 oklch 的浏览器 fallback：静态纯色 */
  background-color: rgb(30, 35, 55) !important;
  color: rgb(30, 30, 30) !important;
  border-color: rgb(180, 185, 200) !important;

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

/* 亮色主题覆盖 */
[data-theme="light"] .prose pre {
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
  color: oklch(18% 0 0) !important;
  border-color: oklch(78% 0.06 260) !important;
}
```

**Fallback 策略**：
- 第一层 `background-color` / `color` / `border-color` 为 RGB 静态纯色（不支持 oklch 的浏览器）
- 第二层 `background` 为 OKLCH 渐变（现代浏览器覆盖第一层）
- `!important` 仅用于确保覆盖 Tailwind/typography 插件生成的样式
```

### 3.9 `tailwind.config.mjs` typography 配置

同步更新 `@tailwindcss/typography` 插件配置中的 `pre` 样式，与 CSS 保持一致。

---

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/styles/themes/light.css` | 更新所有背景色、文字色、玻璃拟态变量 |
| `src/styles/themes/dark.css` | 更新所有背景色、文字色、玻璃拟态变量 |
| `src/styles/typography.css` | 重写 `.prose pre` 样式，添加极光渐变动画 |
| `tailwind.config.mjs` | 同步 typography 插件配置 |

---

## 验收标准

### 功能验收

- [ ] 亮色主题下代码块背景为浅蓝紫色极光渐变，文字为深色
- [ ] 暗色主题下代码块背景为深蓝紫色极光渐变，文字为冷白
- [ ] 代码块背景动画流畅流动，12 秒一圈，不闪烁不跳跃
- [ ] 亮色主题正文背景为明显蓝调浅灰，文字为带蓝调的深色
- [ ] 暗色主题正文背景为深蓝黑（接近纯黑），文字为冷蓝白
- [ ] 跟随系统主题切换时效果与手动切换一致

### 视觉验收

- [ ] 亮色主题整体有科技氛围，不再是纯灰单调配色
- [ ] 暗色主题有深空沉浸感，代码块是最亮的视觉焦点
- [ ] 代码块在两个主题下都与整体风格协调，不突兀
- [ ] 渐变动画不会引起视觉疲劳或分散注意力

### 兼容性验收

- [ ] 不支持 `oklch` 的浏览器有 fallback 值
- [ ] 不支持 CSS 动画的浏览器代码块仍可正常阅读
- [ ] Chrome、Safari、Firefox 最新版正常渲染
- [ ] 移动端 Safari 和 Chrome 正常显示

---

## 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 动画引起性能问题 | 低 | 中 | CSS transform 类动画由 GPU 合成，12s 周期很慢，影响极小 |
| 不支持 oklch 的浏览器 | 低 | 低 | 提供 RGB fallback（已在 typography.css 中存在 fallback 模式） |
| 文字对比度不达标 | 低 | 高 | 所有配色组合 WCAG AA 标准检查 |
| Shiki 语法高亮被覆盖 | 低 | 中 | 高亮颜色使用 `!important`，只在代码文字上生效，不影响背景 |

---

## 设计决策记录

### ADR-001: 极光渐变色相选择

**决策**：选择青蓝→紫→靛蓝（220°-280°）作为极光渐变色相范围。

**理由**：项目色彩体系围绕色相 260°（蓝紫轴）构建，此色相范围与现有体系保持一致，不会突兀。

**替代方案**：
- 蓝紫→青绿：青绿偏离现有色彩语言
- 蓝→紫→粉：粉色与项目赛博朋克/科技风格不符

### ADR-002: CSS 动画实现方式

**决策**：纯 CSS `@keyframes` + `background-size` 流动效果。

**理由**：GPU 加速、零 JS 开销、与 Shiki 无冲突、12s 周期不干扰阅读。

### ADR-003: 亮色主题色相从 260° 微调至 240°

**决策**：亮色主题背景色相从紫蓝（260°）微调至正蓝（240°）。

**理由**：240° 更符合"科技蓝"认知，260° 在亮色下偏紫，不如正蓝自然。
