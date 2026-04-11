/**
 * @fileoverview 阅读量统计组件
 * @description 展示文章的阅读次数，使用 localStorage 模拟统计（无后端时）
 * @example
 * <ViewCount slug="welcome-to-pixelverse" />
 */

import { useState, useEffect, type ReactNode } from 'react';

export interface ViewCountProps {
  /** 文章 slug */
  slug: string;
  /** 是否显示标签文字 */
  showLabel?: boolean;
}

const STORAGE_PREFIX = 'view-count-';

/**
 * ViewCount 阅读量组件
 */
export function ViewCount({
  slug,
  showLabel = true,
}: ViewCountProps): ReactNode {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 增加阅读计数
    try {
      const key = `${STORAGE_PREFIX}${slug}`;
      const stored = localStorage.getItem(key);
      const newCount = stored ? parseInt(stored, 10) + 1 : 1;
      localStorage.setItem(key, String(newCount));
      setCount(newCount);
    } catch {
      setCount(0);
    }
  }, [slug]);

  if (count === 0) {
    return null;
  }

  return (
    <span
      className="flex items-center gap-1 text-sm text-text-tertiary"
      aria-label={`${count} 次阅读`}
    >
      {/* 眼睛图标 */}
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
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      {showLabel && <span>阅读</span>}
      <span>{count}</span>
    </span>
  );
}

export default ViewCount;
