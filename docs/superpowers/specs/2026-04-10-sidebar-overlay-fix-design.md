# 设计文档：侧边栏悬浮展开时推走主内容区

**日期**: 2026-04-10
**分支**: 004-admin-cms
**问题**: 左侧侧边栏未固定时（悬浮展开态），由于使用 `fixed` 定位脱离文档流，导致侧边栏内容与主内容区重叠，影响阅读体验。

---

## 1. 方案概述

将侧边栏从 `fixed` 定位改为 flex 布局内的正常子元素，通过 `width` 动画实现展开/收起，使主内容区在侧边栏展开时自然向右让位，避免重叠。

## 2. 设计决策

### 2.1 为什么选择"推走内容"而非"遮罩/覆盖"

| 方案 | 优点 | 缺点 |
|------|------|------|
| 推走内容（选定）| 行为一致、阅读体验好、符合书脊隐喻、实现简单 | 小屏幕下内容区变窄 |
| 半透明遮罩 | 内容完整可见 | 视觉噪音、阅读打断 |
| 不透明覆盖 | 实现简单 | 严重遮挡正文，阅读体验最差 |

### 2.2 架构调整

**Before**: `fixed` 定位 + 手动 `marginLeft`
- `<aside>` 使用 `fixed top-0 left-0` 脱离文档流
- 仅 `isPinned` 时主内容区设置 `marginLeft: 260px`
- 悬浮展开时侧边栏浮在内容上方

**After**: flex 布局 + `width` 过渡
- `<aside>` 作为 flex 子项，`shrink-0` 防止被压缩
- 通过 `width: 0 → 260px` 控制显示，主内容区自然挤压
- 所有状态下行为一致

## 3. 组件级改动

### 3.1 AdminLayout.astro

**改动**: 无实质改动，当前 `flex h-screen` 布局已支持侧边栏作为 flex 子项。

**现有结构**（无需改动）:
```html
<div class="flex h-screen">
  <SidebarMount />
  <div class="flex min-h-0 flex-1 flex-col">
    <header>...</header>
    <main>...</main>
  </div>
</div>
```

此结构天然支持侧边栏宽度变化时主内容区的自适应。

### 3.2 Sidebar.tsx

**改动点**:

| 改动项 | Before | After | 原因 |
|--------|--------|-------|------|
| aside 定位 | `fixed top-0 left-0 z-50` | `shrink-0` | 回归文档流，由 flex 管理位置 |
| aside 显隐 | `translateX(-100%)` | `width: 0px` | 用宽度变化替代位移，自然挤压兄弟元素 |
| aside 宽度 | 固定 `260px` + translate | `width: ${sidebarWidth}px` | 当前已有此逻辑，移除 fixed 后即可生效 |
| 主内容偏移 | `marginLeft: isPinned ? '260px' : '0px'` | `marginLeft: ${sidebarWidth}px` | 所有状态统一用 sidebarWidth 驱动 |
| 书脊定位 | `sidebar-spine` 全局固定定位 | 改为 aside 内的 `absolute left-0` 或保留为 aside 兄弟但用 flex 定位 | 确保始终在侧边栏左边缘 |
| rounded/shadow | `isShowing` 时添加 | 保持不变 | 视觉风格不变 |

**关键代码变化**:

```tsx
// 之前
<aside className="fixed top-0 left-0 z-50 ...">
  style={{ width: `${sidebarWidth}px`, transform: isShowing ? 'translateX(0)' : 'translateX(-100%)' }}
</aside>
<div style={{ marginLeft: isPinned ? '260px' : '0px' }} />

// 之后
<aside className="shrink-0 ...">
  style={{ width: `${sidebarWidth}px` }}
</aside>
<div style={{ marginLeft: `${sidebarWidth}px` }} />
```

### 3.3 global.css

**改动**: 可能需要调整 `sidebar-spine` 的定位方式。

当前书脊使用全局类 `.sidebar-spine` 配合固定定位。改为 flex 布局后：
- 方案 A: 将书脊放入 aside 内部，用 `absolute left-0` 定位
- 方案 B: 保留为独立元素，改为 flex 布局中的窄元素（`w-1`）

推荐方案 B，因为书脊"始终可见"的特性更适合独立于侧边栏面板。

## 4. 动画行为

| 交互 | 行为 | 时长 |
|------|------|------|
| 鼠标悬停书脊 | 150ms 延迟后 `width: 0 → 260px` | 500ms (ease-float) |
| 鼠标离开侧边栏 | `width: 260px → 0` | 500ms (ease-float) |
| 点击书脊 | 立即 `width: 0 → 260px` | 500ms |
| 点击 Pin 按钮 | 切换固定/悬浮模式 | 500ms |
| 点击关闭按钮 | `width: 260px → 0` | 500ms |

动画通过 CSS `transition-all duration-500 ease-float` 实现，无需 JS 动画。

## 5. 响应式行为

| 断点 | 行为 |
|------|------|
| `sm` 及以上 | 悬浮展开推走内容，正常 |
| `md` 及以上 | 同上 |
| 小屏幕 | 内容区变窄但不会重叠，可接受 |
| 极端小屏幕（< 640px）| 后续迭代处理（全屏覆盖或隐藏侧边栏） |

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `overflow-hidden` 导致动画内容被裁剪 | 中等 | 确保 aside 的 overflow 设置在动画完成后生效，或使用 `overflow-clip` |
| 书脊定位偏移 | 低 | 用 flex 布局替代 fixed 定位，位置由父容器控制 |
| 主内容区过窄时布局崩坏 | 低 | flex 布局自动处理，内容区 `min-w-0` 确保可收缩 |

## 7. 验收标准

- [ ] 悬浮展开侧边栏时，主内容区向右让位，无重叠
- [ ] 悬浮收起侧边栏时，主内容区恢复全宽
- [ ] 固定/取消固定行为与之前一致
- [ ] 动画过渡流畅（500ms ease-float）
- [ ] 书脊始终可见且在正确位置
- [ ] 响应式下不出现水平滚动条
- [ ] 不影响其他组件（TOC、搜索框等）
