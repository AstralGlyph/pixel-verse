/**
 * @fileoverview 响应式侧边栏组件
 * @description 根据屏幕尺寸和用户偏好显示图标栏或完整侧边栏
 * 平板 (<lg): 默认 48px 图标栏，悬停/点击弹出菜单浮层
 * 笔记本/大屏 (lg+): 默认展开，可手动折叠为 48px 图标栏
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebarStore } from '../../stores/sidebar.store';
import { navItems } from '../../config/navigation';

export function Sidebar() {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const [screenSize, setScreenSize] = useState<'tablet' | 'laptop' | 'desktop'>('laptop');
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  // 检测屏幕尺寸
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 1024) setScreenSize('tablet');
      else if (w <= 1440) setScreenSize('laptop');
      else setScreenSize('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 当前页面高亮
  useEffect(() => {
    const path = window.location.pathname;
    const match = navItems.find((item) => path.startsWith(item.dataPath));
    if (match) setActiveItem(match.href);
  }, []);

  // 点击外部关闭弹出层
  useEffect(() => {
    if (!popupVisible) return;
    const handler = () => setPopupVisible(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [popupVisible]);

  const isTablet = screenSize === 'tablet';
  // 平板模式下，图标栏点击触发弹出层
  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTablet) {
        e.stopPropagation();
        setPopupVisible((prev) => !prev);
      }
    },
    [isTablet]
  );

  const expandedWidth = screenSize === 'desktop' ? 256 : 200;
  const sidebarWidth = isTablet ? 48 : collapsed ? 48 : expandedWidth;

  return (
    <>
      <aside
        className="relative flex flex-col border-r-2 border-accent-muted/30 bg-glass-bg backdrop-blur-xl transition-all duration-200 overflow-hidden"
        style={{ width: `${sidebarWidth}px` }}
        id="admin-sidebar"
      >
        {/* Logo 区域 */}
        <div className="flex h-16 items-center border-b-2 border-accent-muted/30 px-2 shrink-0">
          {isTablet || collapsed ? (
            <span className="mx-auto text-lg">📌</span>
          ) : (
            <h1 className="text-lg font-bold tracking-tight text-accent-primary">
              Admin CMS
            </h1>
          )}
        </div>

        {/* 折叠按钮（仅笔记本/大屏显示） */}
        {!isTablet && (
          <button
            onClick={toggle}
            className="absolute top-2 right-2 z-20 p-1 rounded-md text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* 导航菜单 */}
        <nav className="mt-4 space-y-0.5 px-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-text-primary transition-all duration-normal hover:bg-accent-primary/10 hover:text-accent-primary ${
                  isActive
                    ? 'bg-glass-bg-active text-accent-primary border-l-2 border-accent-primary'
                    : ''
                } ${isTablet || collapsed ? 'justify-center' : ''}`}
                onClick={isTablet ? handleIconClick : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!isTablet && !collapsed) && (
                  <span className="truncate">{item.label}</span>
                )}
                {/* Tooltip（收起状态悬停显示） */}
                {(isTablet || collapsed) && (
                  <span className="absolute left-full ml-2 z-50 hidden group-hover:block rounded-md bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* 平板弹出层 */}
        {isTablet && popupVisible && (
          <div
            className="fixed inset-y-0 left-12 w-44 bg-glass-bg backdrop-blur-xl border-r-2 border-accent-muted/30 z-40 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mt-20 space-y-0.5 px-3">
              {navItems.map((item) => {
                const isActive = activeItem === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-all hover:bg-accent-primary/10 hover:text-accent-primary ${
                      isActive ? 'bg-glass-bg-active text-accent-primary' : ''
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* 平板弹出层遮罩 */}
      {isTablet && popupVisible && (
        <div className="fixed inset-0 z-30 bg-black/20 pointer-events-none" />
      )}
    </>
  );
}

export default Sidebar;
