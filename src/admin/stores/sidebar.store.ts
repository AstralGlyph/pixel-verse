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
