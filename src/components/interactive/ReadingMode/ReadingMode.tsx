/**
 * @fileoverview 沉浸式阅读模式组件
 * @description 一键隐藏所有非内容元素，扩展内容区域，提供极致阅读体验
 * @description 支持键盘快捷键切换（R 键）
 * @example
 * <ReadingMode />
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';

export interface ReadingModeProps {
  /** 是否默认开启 */
  defaultActive?: boolean;
  /** 状态变化回调 */
  onChange?: (isActive: boolean) => void;
}

const STORAGE_KEY = 'reading-mode-active';

/**
 * ReadingMode 沉浸式阅读模式组件
 */
export function ReadingMode({
  defaultActive = false,
  onChange,
}: ReadingModeProps): ReactNode {
  const [isActive, setIsActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return defaultActive;
  });

  const toggleReadingMode = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  // 键盘快捷键：R 键切换
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略在输入框中的按键
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // R 键切换阅读模式（需要同时按下 Shift 避免误触）
      if (event.key === 'r' && event.shiftKey) {
        event.preventDefault();
        toggleReadingMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleReadingMode]);

  // 应用/移除阅读模式样式
  useEffect(() => {
    const html = document.documentElement;

    if (isActive) {
      html.classList.add('reading-mode');
    } else {
      html.classList.remove('reading-mode');
    }

    return () => html.classList.remove('reading-mode');
  }, [isActive]);

  return (
    <button
      type="button"
      onClick={toggleReadingMode}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${
          isActive
            ? 'bg-accent text-white shadow-sm'
            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-border'
        }
      `}
      aria-label={isActive ? '退出阅读模式' : '进入阅读模式'}
      aria-pressed={isActive}
      title="Shift+R 切换阅读模式"
    >
      {/* 阅读图标 */}
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span className="hidden sm:inline">
        {isActive ? '退出阅读' : '阅读模式'}
      </span>
    </button>
  );
}

export default ReadingMode;
