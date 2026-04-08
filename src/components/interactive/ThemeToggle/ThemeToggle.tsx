/**
 * @fileoverview ThemeToggle 主题切换组件
 * @description 支持暗色、亮色、跟随系统三种主题模式切换
 */

import { type ReactNode, useState, useEffect, useCallback } from 'react';

/**
 * ThemeToggle 组件属性
 */
export interface ThemeToggleProps {
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 主题类型
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * ThemeToggle 主题切换组件
 */
export function ThemeToggle({
  showLabel = false,
  className = '',
}: ThemeToggleProps): ReactNode {
  const [theme, setTheme] = useState<Theme>('system');
  const [isOpen, setIsOpen] = useState(false);

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 应用主题
  const applyTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // 解析实际主题
    let resolvedTheme: 'light' | 'dark';
    if (newTheme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolvedTheme = newTheme;
    }

    // 使用 View Transitions API（如果支持）
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      });
    } else {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }

    setIsOpen(false);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute(
        'data-theme',
        e.matches ? 'dark' : 'light'
      );
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const themeOptions: Array<{ value: Theme; label: string; icon: ReactNode }> = [
    {
      value: 'light',
      label: '亮色',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: '暗色',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
    {
      value: 'system',
      label: '跟随系统',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label="切换主题"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="theme-options-panel"
      >
        {/* 亮色图标（暗色模式下显示） */}
        <svg
          className="h-5 w-5 hidden dark:block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* 暗色图标（亮色模式下显示） */}
        <svg
          className="h-5 w-5 block dark:hidden"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        {showLabel && (
          <span className="ml-2 text-sm">主题</span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单面板 */}
          <div
            id="theme-options-panel"
            className="absolute right-0 mt-2 w-40 bg-bg border border-border rounded-lg shadow-lg overflow-hidden z-50"
            role="listbox"
            aria-label="主题选项"
          >
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => applyTheme(option.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${theme === option.value
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-primary hover:bg-bg-tertiary'
                  }
                `}
                role="option"
                aria-selected={theme === option.value}
              >
                <span className="text-text-tertiary">{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {theme === option.value && (
                  <svg
                    className="w-4 h-4 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeToggle;