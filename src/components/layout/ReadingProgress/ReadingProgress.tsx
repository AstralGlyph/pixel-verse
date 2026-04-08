/**
 * @fileoverview ReadingProgress 阅读进度条组件
 * @description 顶部细线进度指示器，显示当前阅读百分比
 */

import { type ReactNode, useState, useEffect, useCallback } from 'react';

/**
 * ReadingProgress 组件属性
 */
export interface ReadingProgressProps {
  /** 是否显示百分比文字 */
  showPercentage?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * ReadingProgress 阅读进度条组件
 */
export function ReadingProgress({
  showPercentage = false,
  className = '',
}: ReadingProgressProps): ReactNode {
  const [progress, setProgress] = useState(0);

  // 计算阅读进度
  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) {
      setProgress(0);
      return;
    }

    const currentProgress = (scrollTop / docHeight) * 100;
    setProgress(Math.min(100, Math.max(0, currentProgress)));
  }, []);

  useEffect(() => {
    // 初始化进度
    updateProgress();

    // 监听滚动事件
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [updateProgress]);

  return (
    <div
      className={`reading-progress-container fixed top-0 left-0 right-0 z-50 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="阅读进度"
    >
      {/* 进度条 */}
      <div
        className="h-[2px] bg-accent transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* 百分比显示（可选） */}
      {showPercentage && progress > 0 && progress < 100 && (
        <div className="absolute right-4 top-4 bg-bg-tertiary px-2 py-1 rounded text-xs text-text-secondary">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export default ReadingProgress;