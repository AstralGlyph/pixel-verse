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
