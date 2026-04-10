# 侧边栏悬浮展开推走内容 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将侧边栏从 `fixed` 定位改为 flex 布局子项，悬浮展开时推走主内容区，避免重叠。

**Architecture:** 移除 `<aside>` 的 `fixed top-0 left-0` 定位，改为 `shrink-0 h-screen` 使其成为 flex 布局中的正常子元素。通过 `width: 0 → 260px` 过渡动画实现展开/收起，主内容区通过 `marginLeft` 同步偏移。书脊保持 `fixed left-0` 定位不变。

**Tech Stack:** React 18, Tailwind CSS v4, TypeScript

---

### Task 1: 修改 Sidebar.tsx — 从 fixed 定位改为 flex 子项

**Files:**
- Modify: `src/admin/components/layout/Sidebar.tsx:50-67`

- [ ] **Step 1: 修改 `<aside>` 的 className，移除 fixed 定位**

将 `<aside>` 的 className 从：
```tsx
className={`fixed top-0 left-0 z-50 h-screen flex flex-col border-r border-border-secondary bg-card-bg transition-all duration-500 ease-float overflow-hidden ${
  isShowing ? 'rounded-r-[var(--radius-xl)] shadow-floating' : ''
}`}
```
改为：
```tsx
className={`shrink-0 h-screen flex flex-col border-r border-border-secondary bg-card-bg transition-all duration-500 ease-float overflow-hidden ${
  isShowing ? 'rounded-r-[var(--radius-xl)] shadow-floating' : ''
}`}
```

说明：
- 移除 `fixed top-0 left-0 z-50` — 不再脱离文档流
- 添加 `shrink-0` — 防止 flex 子项被压缩
- 保留 `h-screen flex flex-col` 等布局类
- 保留 `overflow-hidden` — 宽度为 0 时隐藏内容
- 保留 `transition-all duration-500 ease-float` — 宽度过渡动画

- [ ] **Step 2: 修改 `<aside>` 的 style，移除 transform**

将 style 从：
```tsx
style={{
  width: `${sidebarWidth}px`,
  transform: isShowing ? 'translateX(0)' : 'translateX(-100%)',
}}
```
改为：
```tsx
style={{
  width: `${sidebarWidth}px`,
}}
```

说明：移除 `transform`，宽度变化由 `transition-all` 自动处理动画。

- [ ] **Step 3: 修改主内容区偏移 div**

将底部 `<div>` 从：
```tsx
<div
  className="transition-all duration-500 ease-float"
  style={{ marginLeft: isPinned ? '260px' : '0px' }}
/>
```
改为：
```tsx
<div
  className="transition-all duration-500 ease-float"
  style={{ marginLeft: `${sidebarWidth}px` }}
/>
```

说明：统一使用 `sidebarWidth` 驱动偏移，悬浮展开和固定状态行为一致。

- [ ] **Step 4: 验证构建**

```bash
pnpm build
```
预期：构建成功，无 TypeScript 错误

- [ ] **Step 5: 手动验证**

```bash
pnpm dev
```
在浏览器中验证：
- 访问 `/admin` 登录后台
- 鼠标悬停左侧书脊，侧边栏应在 150ms 延迟后展开
- 展开时主内容区应向右移动，无重叠
- 鼠标离开后侧边栏收起，主内容区恢复全宽
- 点击书脊应直接展开
- 点击 Pin 按钮切换固定/悬浮模式，行为与之前一致

- [ ] **Step 6: 提交**

```bash
git add src/admin/components/layout/Sidebar.tsx
git commit -m "fix(sidebar): 改为 flex 子项，悬浮展开推走主内容区"
```

---

### Task 2: 验证无回归影响

**Files:**
- Verify: `src/styles/global.css` (书脊样式无需修改)
- Verify: `src/layouts/AdminLayout.astro` (布局无需修改)

- [ ] **Step 1: 验证书脊样式**

确认 `.sidebar-spine` 的 `position: fixed; left: 0` 在 flex 布局下仍然正确：
- 书脊应始终在视口最左侧
- 悬停书脊应触发侧边栏展开
- 点击书脊应展开侧边栏

当前 global.css 中的书脊样式无需修改，`fixed left-0` 与 flex 布局兼容。

- [ ] **Step 2: 验证 AdminLayout.astro 布局**

确认外层 `<div class="flex h-screen">` 结构不变：
```html
<div class="flex h-screen">
  <SidebarMount />  <!-- flex 子项 -->
  <div class="flex min-h-0 flex-1 flex-col">  <!-- flex 子项 -->
    ...
  </div>
</div>
```

无需修改，当前结构已支持侧边栏宽度变化。

- [ ] **Step 3: 运行 E2E 测试**

```bash
pnpm test:e2e
```
预期：所有测试通过

- [ ] **Step 4: 提交（如有修改）**

如无修改则跳过。如有修改：
```bash
git add <files>
git commit -m "fix(sidebar): 验证 flex 布局无回归"
```
