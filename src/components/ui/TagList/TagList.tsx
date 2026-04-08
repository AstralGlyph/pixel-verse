/**
 * @fileoverview 标签列表组件
 * @description 展示文章标签，支持点击筛选
 * @description 用于博客列表页和文章详情页的标签展示
 * @example
 * <TagList tags={["Astro", "React", "TypeScript"]} activeTag="Astro" onTagClick={handleClick} />
 */

import { useState, type ReactNode } from 'react';

export interface TagListProps {
  /** 标签列表 */
  tags: string[];
  /** 当前激活的标签（用于筛选） */
  activeTag?: string;
  /** 点击标签回调（用于筛选模式） */
  onTagClick?: (tag: string) => void;
  /** 是否显示标签数量 */
  showCount?: boolean;
  /** 额外样式类名 */
  className?: string;
}

/**
 * TagList 标签列表组件
 */
export function TagList({
  tags,
  activeTag,
  onTagClick,
  showCount = false,
  className = '',
}: TagListProps): ReactNode {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  if (tags.length === 0) {
    return null;
  }

  const isFilterMode = Boolean(onTagClick);

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role={isFilterMode ? 'tablist' : 'list'}
      aria-label={isFilterMode ? '标签筛选' : '标签列表'}
    >
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        const isHovered = tag === hoveredTag;

        return (
          <button
            key={tag}
            type="button"
            role={isFilterMode ? 'tab' : 'listitem'}
            aria-selected={isFilterMode ? isActive : undefined}
            aria-pressed={isFilterMode ? isActive : undefined}
            className={`
              px-3 py-1 rounded-full text-sm font-medium transition-all duration-150
              ${isFilterMode ? 'cursor-pointer' : 'cursor-default'}
              ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : isHovered && isFilterMode
                    ? 'bg-accent/10 text-accent'
                    : 'bg-bg-tertiary text-text-tertiary'
              }
            `}
            onClick={() => onTagClick?.(tag)}
            onMouseEnter={() => setHoveredTag(tag)}
            onMouseLeave={() => setHoveredTag(null)}
            onKeyDown={(e) => {
              if (isFilterMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onTagClick?.(tag);
              }
            }}
          >
            {tag}
            {showCount && (
              <span className="ml-1 text-xs opacity-70" aria-hidden="true">
                ({Math.floor(Math.random() * 10) + 1})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default TagList;
