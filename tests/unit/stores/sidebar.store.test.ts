import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSidebarStore } from '../../../src/admin/stores/sidebar.store';

describe('useSidebarStore', () => {
  beforeEach(() => {
    // Reset localStorage mock
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    useSidebarStore.setState({ collapsed: false });
  });

  it('默认未折叠（无 localStorage 值时）', () => {
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

  it('toggle 后持久化到 localStorage', () => {
    const { toggle } = useSidebarStore.getState();
    toggle();
    expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
  });

  it('setCollapsed 后持久化到 localStorage', () => {
    const { setCollapsed } = useSidebarStore.getState();
    setCollapsed(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
  });
});
