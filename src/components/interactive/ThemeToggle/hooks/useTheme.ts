/**
 * @fileoverview useTheme 自定义 Hook
 * @description 提供主题切换功能，支持暗色、亮色、跟随系统三种模式
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 实际应用的主题
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Hook 返回值
 */
interface UseThemeReturn {
  /** 当前主题设置 */
  theme: Theme;
  /** 实际应用的主题 */
  resolvedTheme: ResolvedTheme;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换主题（在 light/dark 之间） */
  toggleTheme: () => void;
}

/**
 * 获取系统偏好主题
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 解析主题
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 主题管理 Hook
 * @returns 主题状态和操作方法
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'system';
    setThemeState(initialTheme);
    setResolvedTheme(resolveTheme(initialTheme));

    // 应用主题到 DOM
    const resolved = resolveTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      document.documentElement.setAttribute('data-theme', newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 设置主题
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;