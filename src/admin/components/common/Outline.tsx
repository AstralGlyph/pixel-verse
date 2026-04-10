/**
 * @fileoverview 大纲组件 — Paper Garden
 * @description 从 HTML 内容中提取标题层级并展示
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ListTree } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface OutlineProps {
  content: string;
  activeId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

/** 从 TipTap 生成的 HTML 中提取标题大纲 */
export function extractToc(content: string): TocItem[] {
  if (!content) return [];

  const items: TocItem[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');

  headings.forEach((heading, index) => {
    const id = heading.id || `heading-${index}`;
    if (!heading.id) {
      heading.id = id;
    }
    items.push({
      id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    });
  });

  return items;
}

/** 大纲侧边栏组件 */
export function Outline({ content, activeId, onNavigate, className = '' }: OutlineProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setItems(extractToc(content));
  }, [content]);

  const handleItemClick = useCallback(
    (id: string) => {
      if (onNavigate) {
        onNavigate(id);
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [onNavigate]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-border-secondary bg-card-bg p-4 shadow-sm ${className}`}>
      <div className="flex shrink-0 items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-text-secondary" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-text-primary">文章大纲</h3>
          <span className="text-xs text-text-tertiary">{items.length} 个标题</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
        >
          <ChevronRight
            className={`h-4 w-4 text-text-tertiary transition-transform duration-fast ${
              collapsed ? '' : 'rotate-90'
            }`}
          />
        </button>
      </div>

      {!collapsed && (
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const indent = (item.level - 1) * 12;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left rounded-md py-1.5 px-2 transition-colors truncate ${
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary font-medium border-l-2 border-accent-primary'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
                style={{
                  paddingLeft: `${12 + indent}px`,
                  fontSize: item.level === 1 ? '14px' : item.level === 2 ? '13px' : '12px',
                }}
                title={item.text}
              >
                <span className="inline-block w-4 text-text-tertiary/50 text-xs mr-1">
                  {item.level === 1 ? '●' : item.level === 2 ? '○' : '·'}
                </span>
                {item.text}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default Outline;
