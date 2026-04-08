/**
 * @fileoverview TOC 目录导航组件
 * @description 文章目录导航，支持高亮当前章节
 */

import { type ReactNode, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * 标题项定义
 */
export interface HeadingItem {
  /** 标题级别 (1-6) */
  level: number;
  /** 标题文本 */
  text: string;
  /** 标题 slug (id) */
  slug: string;
}

/**
 * TOC 组件属性
 */
export interface TOCProps {
  /** 标题列表 */
  headings: HeadingItem[];
  /** 是否显示在移动端 */
  showOnMobile?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * TOC 目录导航组件
 */
export function TOC({
  headings,
  showOnMobile = false,
  className = '',
}: TOCProps): ReactNode {
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 过滤出有效的标题（h2-h4）
  const visibleHeadings = useMemo(
    () => headings.filter((h) => h.level >= 2 && h.level <= 4),
    [headings]
  );

  // 监听滚动更新当前激活的标题
  useEffect(() => {
    if (visibleHeadings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 找到第一个可见的标题
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSlug(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // 观察所有标题元素
    visibleHeadings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [visibleHeadings]);

  // 点击标题平滑滚动
  const handleHeadingClick = useCallback((slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      const offset = 80; // 导航栏高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSlug(slug);
      setIsExpanded(false);
    }
  }, []);

  // 如果没有标题，不渲染
  if (visibleHeadings.length === 0) {
    return null;
  }

  return (
    <nav
      className={`toc-nav ${className}`}
      aria-label="文章目录"
    >
      {/* 桌面端 - 固定侧边栏 */}
      <div className="hidden lg:block sticky top-20">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          目录
        </h3>
        <ul className="space-y-2">
          {visibleHeadings.map((heading) => {
            const isActive = activeSlug === heading.slug;
            const indentClass = {
              2: 'pl-0',
              3: 'pl-3',
              4: 'pl-6',
            }[heading.level] || 'pl-0';

            return (
              <li key={heading.slug}>
                <button
                  type="button"
                  onClick={() => handleHeadingClick(heading.slug)}
                  className={`
                    text-sm text-left w-full truncate transition-colors
                    ${indentClass}
                    ${isActive
                      ? 'text-accent font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 移动端 - 可展开菜单 */}
      {showOnMobile && (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary bg-bg-secondary rounded-lg border border-border"
            aria-expanded={isExpanded}
            aria-controls="toc-mobile-panel"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <span>目录</span>
          </button>

          {isExpanded && (
            <div id="toc-mobile-panel" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="目录导航">
              {/* 背景遮罩 */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsExpanded(false)}
              />

              {/* 目录面板 */}
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-bg border-l border-border p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary">
                    目录
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-text-secondary hover:text-text-primary"
                    aria-label="关闭目录"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <ul className="space-y-2">
                  {visibleHeadings.map((heading) => {
                    const isActive = activeSlug === heading.slug;
                    const indentClass = {
                      2: 'pl-0',
                      3: 'pl-3',
                      4: 'pl-6',
                    }[heading.level] || 'pl-0';

                    return (
                      <li key={heading.slug}>
                        <button
                          type="button"
                          onClick={() => handleHeadingClick(heading.slug)}
                          className={`
                            text-sm text-left w-full truncate py-1 transition-colors
                            ${indentClass}
                            ${isActive
                              ? 'text-accent font-medium'
                              : 'text-text-secondary hover:text-text-primary'
                            }
                          `}
                        >
                          {heading.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default TOC;