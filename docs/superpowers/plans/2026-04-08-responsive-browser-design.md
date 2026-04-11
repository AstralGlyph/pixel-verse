# 浏览器响应式适配实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现前端页面和管理后台的浏览器尺寸适配，确保手机、平板、笔记本、大屏显示器均有良好体验。

**Architecture:** 管理后台侧边栏从 Astro 静态 HTML 转为 React 交互式组件（支持折叠/展开），前端页面在现有响应式基础上补充完善。使用 Zustand 管理侧边栏状态，CSS 响应式类处理大部分布局适配。

**Tech Stack:** Astro 5.x, React 18.x, Tailwind CSS v4, Zustand, lucide-react

---

## 文件结构总览

**新建文件:**
- `src/admin/stores/sidebar.store.ts` — 侧边栏状态管理
- `src/admin/config/navigation.ts` — 导航菜单配置（共享数据）
- `src/admin/components/layout/Sidebar.tsx` — 响应式侧边栏组件
- `tests/unit/stores/sidebar.store.test.ts` — 侧边栏状态单元测试

**修改文件:**
- `src/layouts/AdminLayout.astro` — 侧边栏替换为 React 组件挂载点
- `src/layouts/PostLayout.astro` — 文章内容区添加 max-width 限制
- `src/styles/global.css` — 补充响应式工具类
- `src/admin/pages/users.tsx` — 表格横向滚动
- `src/admin/pages/audit-log.tsx` — 表格横向滚动
- `src/admin/components/layout/AdminLayout.tsx` — 标记废弃

---

## 导航配置提取

当前 `AdminLayout.astro` 和 `AdminLayout.tsx` 都硬编码了导航菜单项。需要提取到共享配置文件。

### Task 1: 创建导航配置文件

**Files:**
- Create: `src/admin/config/navigation.ts`

- [ ] **Step 1: 创建导航配置文件**

```ts
// src/admin/config/navigation.ts
/**
 * @fileoverview 管理后台导航菜单配置
 * @description 共享的导航项列表，供 Astro 侧边栏和 React 侧边栏组件使用
 */

import {
  LayoutDashboard,
  FileText,
  Tag,
  Tags,
  Image,
  FileStack,
  Users,
  ScrollText,
  Settings,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  dataPath: string;
}

export const navItems: NavItem[] = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard, dataPath: '/admin/dashboard' },
  { label: '文章管理', href: '/admin/posts', icon: FileText, dataPath: '/admin/posts' },
  { label: '分类管理', href: '/admin/categories', icon: Tag, dataPath: '/admin/categories' },
  { label: '标签管理', href: '/admin/tags', icon: Tags, dataPath: '/admin/tags' },
  { label: '媒体库', href: '/admin/media', icon: Image, dataPath: '/admin/media' },
  { label: '页面管理', href: '/admin/pages-admin', icon: FileStack, dataPath: '/admin/pages' },
  { label: '用户管理', href: '/admin/users', icon: Users, dataPath: '/admin/users' },
  { label: '审计日志', href: '/admin/audit-log', icon: ScrollText, dataPath: '/admin/audit-log' },
  { label: '设置', href: '/admin/settings', icon: Settings, dataPath: '/admin/settings' },
];
```

- [ ] **Step 2: 验证 lucide-react 图标名称**

Run: `pnpm dev` then check console for import errors.
Expected: No errors. If any icon name is wrong, adjust accordingly.

- [ ] **Step 3: 提交**

```bash
git add src/admin/config/navigation.ts
git commit -m "feat: 提取导航菜单配置为共享模块"
```

---

## 侧边栏状态管理

使用 Zustand 管理侧边栏的折叠/展开状态，并通过 localStorage 持久化。

### Task 2: 创建侧边栏 Zustand Store

**Files:**
- Create: `src/admin/stores/sidebar.store.ts`
- Create: `tests/unit/stores/sidebar.store.test.ts`

- [ ] **Step 1: 编写测试**

```ts
// tests/unit/stores/sidebar.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSidebarStore } from '../../../src/admin/stores/sidebar.store';

describe('useSidebarStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({ collapsed: false });
  });

  it('默认未折叠', () => {
    const store = useSidebarStore.getState();
    expect(store.collapsed).toBe(false);
  });

  it('toggle 切换折叠状态', () => {
    const { toggle } = useSidebarStore.getState();
    toggle();
    expect(useSidebarStore.getState().collapsed).toBe(true);
    toggle();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('setCollapsed 直接设置状态', () => {
    const { setCollapsed } = useSidebarStore.getState();
    setCollapsed(true);
    expect(useSidebarStore.getState().collapsed).toBe(true);
    setCollapsed(false);
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('localStorage 持久化 - 读取已有值', () => {
    localStorage.setItem('sidebar-collapsed', 'true');
    // 需要重新创建 store 来读取 localStorage
    // 在真实实现中，store 初始化时读取 localStorage
    // 这里测试 toggle 后的持久化
    const { toggle } = useSidebarStore.getState();
    toggle();
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
  });

  it('toggle 后持久化到 localStorage', () => {
    const { toggle } = useSidebarStore.getState();
    toggle();
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `pnpm vitest run tests/unit/stores/sidebar.store.test.ts`
Expected: FAIL - store file not found

- [ ] **Step 3: 实现 Store**

```ts
// src/admin/stores/sidebar.store.ts
/**
 * @fileoverview 侧边栏状态管理
 * @description 管理侧边栏折叠/展开状态，localStorage 持久化
 */

import { create } from 'zustand';

const STORAGE_KEY = 'sidebar-collapsed';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

function getInitialCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // SSR 环境
  }
  return false;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: getInitialCollapsed(),
  toggle: () =>
    set((state) => {
      const next = !state.collapsed;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage 不可用，忽略
      }
      return { collapsed: next };
    }),
  setCollapsed: (value) =>
    set(() => {
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // localStorage 不可用，忽略
      }
      return { collapsed: value };
    }),
}));
```

- [ ] **Step 4: 运行测试验证通过**

Run: `pnpm vitest run tests/unit/stores/sidebar.store.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: 提交**

```bash
git add src/admin/stores/sidebar.store.ts tests/unit/stores/sidebar.store.test.ts
git commit -m "feat: 添加侧边栏状态管理 Store（支持持久化）"
```

---

## 侧边栏 React 组件

核心组件，实现平板/笔记本/大屏三种尺寸的侧边栏行为。

### Task 3: 创建响应式侧边栏组件

**Files:**
- Create: `src/admin/components/layout/Sidebar.tsx`

- [ ] **Step 1: 创建 Sidebar 组件**

```tsx
// src/admin/components/layout/Sidebar.tsx
/**
 * @fileoverview 响应式侧边栏组件
 * @description 根据屏幕尺寸和用户偏好显示图标栏或完整侧边栏
 * 平板 (<lg): 默认 48px 图标栏，悬停/点击弹出菜单浮层
 * 笔记本/大屏 (lg+): 默认展开，可手动折叠为 48px 图标栏
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebarStore } from '../../stores/sidebar.store';
import { navItems } from '../../config/navigation';

export function Sidebar() {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const [screenSize, setScreenSize] = useState<'tablet' | 'laptop' | 'desktop'>('laptop');
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  // 检测屏幕尺寸
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 1024) setScreenSize('tablet');
      else if (w <= 1440) setScreenSize('laptop');
      else setScreenSize('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 当前页面高亮
  useEffect(() => {
    const path = window.location.pathname;
    const match = navItems.find((item) => path.startsWith(item.dataPath));
    if (match) setActiveItem(match.href);
  }, []);

  // 点击外部关闭弹出层
  useEffect(() => {
    if (!popupVisible) return;
    const handler = () => setPopupVisible(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [popupVisible]);

  const isTablet = screenSize === 'tablet';
  // 平板模式下，图标栏点击触发弹出层
  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTablet) {
        e.stopPropagation();
        setPopupVisible((prev) => !prev);
      }
    },
    [isTablet]
  );

  const expandedWidth = screenSize === 'desktop' ? 256 : 200;
  const sidebarWidth = isTablet ? 48 : collapsed ? 48 : expandedWidth;

  return (
    <>
      <aside
        className="relative flex flex-col border-r-2 border-accent-muted/30 bg-glass-bg backdrop-blur-xl transition-all duration-200 overflow-hidden"
        style={{ width: `${sidebarWidth}px` }}
        id="admin-sidebar"
      >
        {/* Logo 区域 */}
        <div className="flex h-16 items-center border-b-2 border-accent-muted/30 px-2 shrink-0">
          {isTablet || collapsed ? (
            <span className="mx-auto text-lg">📌</span>
          ) : (
            <h1 className="text-lg font-bold tracking-tight text-accent-primary">
              Admin CMS
            </h1>
          )}
        </div>

        {/* 折叠按钮（仅笔记本/大屏显示） */}
        {!isTablet && (
          <button
            onClick={toggle}
            className="absolute top-2 right-2 z-20 p-1 rounded-md text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* 导航菜单 */}
        <nav className="mt-4 space-y-0.5 px-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-text-primary transition-all duration-normal hover:bg-accent-primary/10 hover:text-accent-primary ${
                  isActive
                    ? 'bg-glass-bg-active text-accent-primary border-l-2 border-accent-primary'
                    : ''
                } ${isTablet || collapsed ? 'justify-center' : ''}`}
                onClick={isTablet ? handleIconClick : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!isTablet && !collapsed) && (
                  <span className="truncate">{item.label}</span>
                )}
                {/* Tooltip（收起状态悬停显示） */}
                {(isTablet || collapsed) && (
                  <span className="absolute left-full ml-2 z-50 hidden group-hover:block rounded-md bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* 平板弹出层 */}
        {isTablet && popupVisible && (
          <div
            className="fixed inset-y-0 left-12 w-44 bg-glass-bg backdrop-blur-xl border-r-2 border-accent-muted/30 z-40 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mt-20 space-y-0.5 px-3">
              {navItems.map((item) => {
                const isActive = activeItem === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-all hover:bg-accent-primary/10 hover:text-accent-primary ${
                      isActive ? 'bg-glass-bg-active text-accent-primary' : ''
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* 平板弹出层遮罩 */}
      {isTablet && popupVisible && (
        <div className="fixed inset-0 z-30 bg-black/20 pointer-events-none" />
      )}
    </>
  );
}

export default Sidebar;
```

**设计说明:**
- 使用 `window.innerWidth < 1024` 检测平板
- 平板模式: 48px 图标栏 + 点击弹出 48px 宽的菜单浮层
- 笔记本/大屏: 默认 200px 或 256px（根据屏幕尺寸通过 CSS 调整），可折叠为 48px
- 使用 lucide-react 图标替代 emoji
- Tooltip 使用 CSS `group-hover:block` 实现

- [ ] **Step 2: 提交**

```bash
git add src/admin/components/layout/Sidebar.tsx
git commit -m "feat: 添加响应式侧边栏组件（平板/笔记本/大屏适配）"
```

---

## AdminLayout.astro 集成

将侧边栏从静态 HTML 替换为 React 组件挂载点。

### Task 4: 修改 AdminLayout.astro 集成 React 侧边栏

**Files:**
- Modify: `src/layouts/AdminLayout.astro`

- [ ] **Step 1: 替换侧边栏为 React 挂载点**

```astro
---
/**
 * @fileoverview 后台管理布局
 * @description 后台管理页面的通用布局 — Bento + Glassmorphism 风格
 * 侧边栏由 React 组件渲染，支持折叠/展开
 */
import '../styles/global.css';
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
  <body class="h-screen overflow-hidden mesh-bg">
    <div class="flex h-screen">
      <!-- 侧边栏 — React 组件挂载点 -->
      <div id="sidebar-root" class="shrink-0"></div>

      <!-- 主内容区 -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- 头部 -->
        <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-glass-border bg-glass-bg px-6 backdrop-blur-xl">
          <h2 class="text-lg font-semibold text-text-primary"><slot name="page-title" /></h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-secondary" id="admin-username"></span>
            <button id="logout-btn" class="rounded-md bg-error/80 px-4 py-2 text-sm text-white backdrop-blur transition-all duration-normal hover:bg-error hover:scale-[1.02]">
              退出登录
            </button>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="flex-1 min-h-0 overflow-auto p-6 glass-scrollbar page-content">
          <slot />
        </main>
      </div>
    </div>

    <script>
      // 检查认证状态
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

      // 退出登录
      const logoutBtn = document.getElementById('logout-btn');
      logoutBtn?.addEventListener('click', async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin';
      });

      checkAuth();
    </script>

    <!-- 挂载 React 侧边栏 -->
    <script is:inline>
      (function() {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { hydrate } from 'astro/client';
          // Astro 自动处理 client:load 的 React 组件挂载
        `;
        // 侧边栏由 Astro island 方式挂载，见各页面的 Sidebar client:load
      })();
    </script>
  </body>
</html>
```

**关键变化:**
- `<aside>` 替换为 `<div id="sidebar-root" class="shrink-0"></div>`
- 移除 `nav-link` 高亮脚本（由 React 组件处理）
- 侧边栏宽度由 React 组件的 `style={{ width }}` 控制

**注意:** Astro 的 island 架构需要一个挂载组件。我们需要在某个地方用 `client:load` 挂载 Sidebar。最简洁的方式是在 `AdminLayout.astro` 中添加一个 `<slot name="sidebar" />`，然后在每个页面传递 Sidebar 组件。但这太繁琐。

更好的方案：创建一个 `src/pages/admin/sidebar.astro` 作为 island 入口，但这也不理想。

最实际的方案：在 `AdminLayout.astro` 中用 `<script>` 直接 import React Sidebar 并 mount。Astro 支持在 `<script>` 中 import 组件。

让我重新设计 Task 4 的方法。

Actually, the simplest approach for Astro islands is to create a wrapper Astro component that mounts the React sidebar. Let me adjust.

- [ ] **Step 1: 创建侧边栏 Astro 挂载组件**

```astro
---
// src/admin/components/layout/SidebarMount.astro
/**
 * @fileoverview 侧边栏挂载点
 * @description 在 Astro 中挂载 React 侧边栏组件
 */
---

<div id="sidebar-root" class="shrink-0">
  <Sidebar client:load />
</div>

<script>
  import { Sidebar } from '../../../admin/components/layout/Sidebar';
</script>
```

Wait, Astro doesn't work this way - you can't import React components in `<script>` tags. The correct approach is to import them in the frontmatter and use them with `client:load` in the template.

Let me revise the approach:

**Revised Step 1: 创建侧边栏 Astro 挂载组件**

```astro
---
// src/admin/components/layout/SidebarMount.astro
/**
 * @fileoverview 侧边栏挂载组件
 * @description 在 AdminLayout 中挂载 React Sidebar 组件
 */
import { Sidebar } from '../../../admin/components/layout/Sidebar';
---

<Sidebar client:load />
```

**Revised Step 2: 修改 AdminLayout.astro**

将 `<aside>` 替换为 `<SidebarMount />`。

```astro
---
/**
 * @fileoverview 后台管理布局
 * @description 后台管理页面的通用布局 — Bento + Glassmorphism 风格
 * 侧边栏由 React 组件渲染，支持折叠/展开
 */
import '../styles/global.css';
import SidebarMount from '../../admin/components/layout/SidebarMount.astro';
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
  <body class="h-screen overflow-hidden mesh-bg">
    <div class="flex h-screen">
      <!-- 侧边栏 — React 组件渲染 -->
      <SidebarMount />

      <!-- 主内容区 -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- 头部 -->
        <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-glass-border bg-glass-bg px-6 backdrop-blur-xl">
          <h2 class="text-lg font-semibold text-text-primary"><slot name="page-title" /></h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-secondary" id="admin-username"></span>
            <button id="logout-btn" class="rounded-md bg-error/80 px-4 py-2 text-sm text-white backdrop-blur transition-all duration-normal hover:bg-error hover:scale-[1.02]">
              退出登录
            </button>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="flex-1 min-h-0 overflow-auto p-6 glass-scrollbar page-content">
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

- [ ] **Step 3: 验证 Astro 构建**

Run: `pnpm build 2>&1 | head -30`
Expected: Build succeeds without errors

- [ ] **Step 4: 提交**

```bash
git add src/layouts/AdminLayout.astro src/admin/components/layout/SidebarMount.astro
git commit -m "refactor: AdminLayout 使用 React 侧边栏替代静态 HTML"
```

---

## 前端页面响应式完善

### Task 5: 前端页面响应式优化

**Files:**
- Modify: `src/layouts/PostLayout.astro` — 文章内容最大宽度限制
- Modify: `src/styles/global.css` — 补充响应式工具类

- [ ] **Step 1: PostLayout 添加内容宽度限制**

在 `src/layouts/PostLayout.astro` 的 prose 区域添加 `max-w-prose` 限制：

```astro
---
// 修改第 105 行附近:
---

      <!-- 正文 -->
      <div class="prose prose-lg dark:prose-invert max-w-none lg:max-w-prose">
        <slot />
      </div>
```

同时确保文章整体容器在大屏下有限制：

```astro
<!-- 修改第 50 行 -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:max-w-6xl">
```

- [ ] **Step 2: global.css 补充响应式工具类**

在 `src/styles/global.css` 末尾添加：

```css
/* 响应式辅助 */

/* 表格横向滚动支持 */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive table {
  min-width: 100%;
  white-space: nowrap;
}

/* 触屏友好的点击目标 */
@media (pointer: coarse) {
  button,
  a,
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}

/* 减少动画（无障碍）已存在: prefers-reduced-motion */

/* 侧边栏过渡动画 */
#sidebar-root {
  transition: width 0.2s ease;
}
```

- [ ] **Step 3: 响应式图片懒加载**

在前端页面中找到所有 `<img>` 标签，添加 `loading="lazy"` 属性。主要检查：
- `src/components/layout/Hero/Hero.astro`
- `src/components/layout/BentoGrid/BentoGrid.tsx`
- 文章列表卡片中的图片

示例修改：

```astro
<!-- Before: -->
<img src={image.src} alt={image.alt} />
<!-- After: -->
<img src={image.src} alt={image.alt} loading="lazy" />
```

- [ ] **Step 4: 提交**

```bash
git add src/layouts/PostLayout.astro src/styles/global.css src/components/
git commit -m "feat: 前端页面添加内容宽度限制、响应式工具类和图片懒加载"
```

---

## 管理后台页面适配

### Task 6: 管理后台页面响应式适配

**Files:**
- Modify: `src/admin/pages/dashboard.tsx` — 网格列数优化
- Modify: `src/admin/pages/users.tsx` — 表格横向滚动
- Modify: `src/admin/pages/audit-log.tsx` — 表格横向滚动

- [ ] **Step 1: Dashboard 网格优化**

在 `src/admin/pages/dashboard.tsx` 中检查统计卡片网格，确保响应式：

查找现有的网格布局类，确保有正确的响应式断点。例如，如果统计卡片使用 `grid-cols-4`，改为 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`。

由于 Dashboard 已使用 `sm:grid-cols-2 lg:grid-cols-7`，检查是否需要调整。主要确保在小屏幕下不会出现内容溢出。

- [ ] **Step 2: 用户管理页面表格横向滚动**

在 `src/admin/pages/users.tsx` 中，找到表格容器，添加 `overflow-x-auto`:

```tsx
// 查找包含 <table> 的父级 div
// 将:
<div className="glass-card rounded-xl overflow-hidden">
// 改为:
<div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
  <table className="min-w-full">
```

- [ ] **Step 3: 审计日志页面表格横向滚动**

在 `src/admin/pages/audit-log.tsx` 中，同样添加:

```tsx
<div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
  <table className="min-w-full">
```

- [ ] **Step 4: 验证页面在浏览器中响应**

Run: `pnpm dev`
Open: http://localhost:4321/admin (登录后)
Test: 调整浏览器窗口宽度，验证侧边栏在 768px、1024px、1280px、1920px 下的表现。

- [ ] **Step 5: 提交**

```bash
git add src/admin/pages/dashboard.tsx src/admin/pages/users.tsx src/admin/pages/audit-log.tsx
git commit -m "feat: 管理后台页面响应式适配（网格+表格滚动）"
```

---

## 清理和收尾

### Task 7: 清理旧代码并验证全局

**Files:**
- Modify: `src/admin/components/layout/AdminLayout.tsx` — 标记废弃或更新
- Modify: `src/global.d.ts` — 无变更（响应式不需要额外类型）

- [ ] **Step 1: 标记旧 AdminLayout.tsx 为废弃**

```tsx
// src/admin/components/layout/AdminLayout.tsx
// 在文件头添加注释:
/**
 * @deprecated 此组件已被 AdminLayout.astro + Sidebar.tsx 替代
 * @description 保留此文件仅供参考，后续可删除
 */
```

- [ ] **Step 2: 全面测试**

Run: `pnpm build`
Expected: Build succeeds

Run: `pnpm vitest run`
Expected: All tests pass (including new sidebar.store.test.ts)

- [ ] **Step 3: 提交**

```bash
git add src/admin/components/layout/AdminLayout.tsx
git commit -m "refactor: 标记旧 AdminLayout.tsx 为废弃"
```

---

## 任务依赖关系

```
Task 1 (导航配置)
    ↓
Task 2 (Sidebar Store) ─┐
    ↓                   ↓
Task 3 (Sidebar 组件) ←─┘
    ↓
Task 4 (AdminLayout 集成)
    ↓
Task 5 (前端页面优化)
    ↓
Task 6 (管理页面适配)
    ↓
Task 7 (清理收尾)
```

Task 5 可独立于 Task 1-4 执行（前端页面不依赖管理后台变更）。
Task 1 和 Task 2 可以并行开始，但 Task 3 依赖两者都完成。
