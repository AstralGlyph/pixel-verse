/**
 * @fileoverview 时间线组件
 * @description 展示按时间排序的事件列表，用于关于页面的经历展示
 * @example
 * <Timeline items={[
 *   { date: '2024', title: '事件', description: '描述' },
 * ]} />
 */

import type { ReactNode } from 'react';

export interface TimelineItem {
  /** 日期/时间段 */
  date: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 标签 */
  tags?: string[];
  /** 链接 */
  url?: string;
}

export interface TimelineProps {
  /** 时间线项目 */
  items: TimelineItem[];
  /** 额外样式类名 */
  className?: string;
}

/**
 * Timeline 时间线组件
 */
export function Timeline({ items, className = '' }: TimelineProps): ReactNode {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} role="list" aria-label="时间线">
      {/* 垂直线 */}
      <div
        className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"
        aria-hidden="true"
      />

      <ul className="space-y-8">
        {items.map((item, index) => (
          <li
            key={index}
            className="relative pl-12"
            role="listitem"
          >
            {/* 圆点 */}
            <div
              className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent border-4 border-bg"
              aria-hidden="true"
            />

            {/* 日期 */}
            <time className="text-sm text-text-tertiary font-medium">
              {item.date}
            </time>

            {/* 标题 */}
            <h3 className="text-lg font-semibold text-text-primary mt-1">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h3>

            {/* 描述 */}
            <p className="text-text-secondary mt-1 leading-relaxed">
              {item.description}
            </p>

            {/* 标签 */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-bg-tertiary text-text-tertiary rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Timeline;
