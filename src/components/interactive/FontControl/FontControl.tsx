/**
 * @fileoverview 字体控制组件
 * @description 允许读者调整文章字体大小，提供舒适的阅读体验
 * @description 设置存储在 localStorage 中，跨页面保持
 * @example
 * <FontControl />
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';

export interface FontControlProps {
  /** 最小字体大小 */
  minSize?: number;
  /** 最大字体大小 */
  maxSize?: number;
  /** 步进值 */
  step?: number;
}

const STORAGE_KEY = 'font-size';
const DEFAULT_SIZE = 16;

/**
 * FontControl 字体控制组件
 */
export function FontControl({
  minSize = 14,
  maxSize = 24,
  step = 2,
}: FontControlProps): ReactNode {
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return DEFAULT_SIZE;
  });

  const increase = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.min(prev + step, maxSize);
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, [step, maxSize]);

  const decrease = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.max(prev - step, minSize);
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, [step, minSize]);

  const reset = useCallback(() => {
    setFontSize(DEFAULT_SIZE);
    localStorage.setItem(STORAGE_KEY, String(DEFAULT_SIZE));
  }, []);

  // 应用字体大小到文章内容
  useEffect(() => {
    const articleContent = document.querySelector('.article-content') as HTMLElement | null;
    if (articleContent) {
      articleContent.style.fontSize = `${fontSize}px`;
    }
    return () => {
      if (articleContent) {
        articleContent.style.fontSize = '';
      }
    };
  }, [fontSize]);

  const canDecrease = fontSize > minSize;
  const canIncrease = fontSize < maxSize;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="字体大小控制"
    >
      {/* 减小字体 */}
      <button
        type="button"
        onClick={decrease}
        disabled={!canDecrease}
        className={`
          p-1.5 rounded transition-colors
          ${canDecrease
            ? 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            : 'text-text-tertiary cursor-not-allowed opacity-50'
          }
        `}
        aria-label="减小字体"
        aria-disabled={!canDecrease}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* 当前大小 */}
      <span
        className="px-2 text-xs text-text-tertiary min-w-[2rem] text-center"
        aria-live="polite"
        aria-label={`当前字体大小 ${fontSize}px`}
      >
        {fontSize}
      </span>

      {/* 增大字体 */}
      <button
        type="button"
        onClick={increase}
        disabled={!canIncrease}
        className={`
          p-1.5 rounded transition-colors
          ${canIncrease
            ? 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            : 'text-text-tertiary cursor-not-allowed opacity-50'
          }
        `}
        aria-label="增大字体"
        aria-disabled={!canIncrease}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 重置 */}
      <button
        type="button"
        onClick={reset}
        className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label="重置字体大小"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}

export default FontControl;
