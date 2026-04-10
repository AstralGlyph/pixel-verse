/**
 * @fileoverview Paper Garden 侧边栏 — 书脊式浮动面板
 * @description 默认收起为 4px 橄榄绿渐变线（书脊），悬停/点击展开为 260px 浮动面板
 * 支持固定模式（点击图钉）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Pin, PinOff, ChevronLeft } from 'lucide-react';
import { useSidebarStore } from '../../stores/sidebar.store';
import { navItems } from '../../config/navigation';

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(!collapsed);
  const [activeItem, setActiveItem] = useState('');
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 当前页面高亮
  useEffect(() => {
    const path = window.location.pathname;
    const match = navItems.find((item) => path.startsWith(item.dataPath));
    if (match) setActiveItem(match.href);
  }, []);

  // 展开/收起动画延迟
  const handleMouseEnter = useCallback(() => {
    if (isPinned) return;
    hoverTimerRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 150);
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (!isPinned) {
      setIsExpanded(false);
    }
  }, [isPinned]);

  const handleSpineClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handlePinToggle = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      setCollapsed(!next);
      return next;
    });
  }, [setCollapsed]);

  const isShowing = isPinned || isExpanded;
  const sidebarWidth = isShowing ? 260 : 0;

  return (
    <>
      {/* 书脊 — 始终可见的 4px 渐变线 */}
      {!isPinned && (
        <div
          className="sidebar-spine"
          onClick={handleSpineClick}
          onMouseEnter={handleMouseEnter}
        />
      )}

      {/* 侧边栏面板 */}
      <aside
        className={`shrink-0 h-screen flex flex-col border-r border-border-secondary bg-card-bg transition-all duration-500 ease-float overflow-hidden ${
          isShowing ? 'rounded-r-[var(--radius-xl)] shadow-floating' : ''
        }`}
        style={{
          width: `${sidebarWidth}px`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        id="admin-sidebar"
      >
        {isShowing && (
          <>
            {/* Logo 区域 */}
            <div className="flex h-16 items-center justify-between border-b border-border-secondary px-5 shrink-0">
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                Paper Garden
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePinToggle}
                  className="p-1.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                  aria-label={isPinned ? '取消固定' : '固定侧边栏'}
                  title={isPinned ? '取消固定' : '固定侧边栏'}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </button>
                {!isPinned && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                    aria-label="收起侧栏"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 导航菜单 */}
            <nav className="mt-3 space-y-1 px-3 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast ${
                      isActive
                        ? 'bg-card-bg text-accent-primary border-l-[3px] border-accent-primary shadow-sm'
                        : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary border-l-[3px] border-transparent'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* 底部信息 */}
            <div className="border-t border-border-secondary px-5 py-3 text-xs text-text-tertiary">
              <span>Admin CMS v1.0</span>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
