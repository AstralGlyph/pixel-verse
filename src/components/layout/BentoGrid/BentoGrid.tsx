/**
 * @fileoverview BentoGrid 卡片布局组件
 * @description 灵感来自 Bento Grid 的非对称卡片布局，用于展示精选内容
 */

import { type ReactNode } from 'react';

/**
 * 卡片项属性
 */
export interface BentoItem {
  /** 卡片唯一标识 */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 图标或 emoji */
  icon?: string;
  /** 链接地址 */
  href?: string;
  /** 标签 */
  tags?: string[];
  /** 尺寸：small=1列, medium=2列, large=全列 */
  size?: 'small' | 'medium' | 'large';
}

/**
 * BentoGrid 组件属性
 */
export interface BentoGridProps {
  /** 卡片项列表 */
  items: BentoItem[];
  /** 额外类名 */
  className?: string;
}

/**
 * 单个卡片组件
 */
function BentoCard({ item }: { item: BentoItem }): ReactNode {
  const sizeClass = {
    small: 'md:col-span-1',
    medium: 'md:col-span-2',
    large: 'md:col-span-3',
  }[item.size || 'small'];

  const content = (
    <div className="flex flex-col h-full">
      {/* 图标 */}
      {item.icon && (
        <div className="text-3xl mb-3">{item.icon}</div>
      )}

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {item.title}
      </h3>

      {/* 描述 */}
      {item.description && (
        <p className="text-sm text-text-secondary flex-1">
          {item.description}
        </p>
      )}

      {/* 标签 */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
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
    </div>
  );

  return (
    <div className={`bento-card group ${sizeClass}`}>
      {item.href ? (
        <a
          href={item.href}
          className="block h-full p-6 bg-bg-secondary border border-border rounded-xl hover:border-accent/50 transition-colors"
        >
          {content}
        </a>
      ) : (
        <div className="block h-full p-6 bg-bg-secondary border border-border rounded-xl">
          {content}
        </div>
      )}
    </div>
  );
}

/**
 * BentoGrid 组件
 */
export function BentoGrid({
  items,
  className = '',
}: BentoGridProps): ReactNode {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <BentoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;