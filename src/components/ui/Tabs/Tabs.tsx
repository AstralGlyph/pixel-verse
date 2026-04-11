/**
 * @fileoverview Tabs 标签切换组件
 * @description 支持多标签内容切换展示
 */

import { type ReactNode, createContext, useContext, useState } from 'react';

/**
 * Tabs 上下文
 */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

/**
 * 使用 Tabs 上下文
 */
function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

/**
 * Tabs 容器组件属性
 */
export interface TabsProps {
  /** 默认激活的标签 */
  defaultTab?: string;
  /** 子内容 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * Tabs 容器组件
 */
export function Tabs({
  defaultTab = '',
  children,
  className = '',
}: TabsProps): ReactNode {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`my-6 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * TabList 组件属性
 */
export interface TabListProps {
  /** 子内容（Tab 组件） */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * TabList 标签列表组件
 */
export function TabList({ children, className = '' }: TabListProps): ReactNode {
  const { activeTab, setActiveTab } = useTabsContext();

  // 克隆子元素并注入 activeTab 和 setActiveTab
  const enhancedChildren = Array.isArray(children)
    ? children.map((child) => {
        if (child && typeof child === 'object' && 'props' in child) {
          const childProps = child.props as { id?: string };
          const isActive = childProps.id === activeTab;
          return {
            ...child,
            props: {
              ...child.props,
              isActive,
              onClick: () => childProps.id && setActiveTab(childProps.id),
            },
          };
        }
        return child;
      })
    : children;

  return (
    <div
      className={`flex border-b border-border ${className}`}
      role="tablist"
      aria-label="内容标签"
    >
      {enhancedChildren}
    </div>
  );
}

/**
 * Tab 组件属性
 */
export interface TabProps {
  /** 标签 ID */
  id: string;
  /** 标签标题 */
  label: string;
  /** 是否激活（由 TabList 注入） */
  isActive?: boolean;
  /** 点击回调（由 TabList 注入） */
  onClick?: () => void;
  /** 额外类名 */
  className?: string;
}

/**
 * Tab 单个标签组件
 */
export function Tab({
  id,
  label,
  isActive = false,
  onClick,
  className = '',
}: TabProps): ReactNode {
  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium transition-colors
        border-b-2 -mb-px
        ${
          isActive
            ? 'border-accent text-text-primary'
            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}

/**
 * TabPanel 组件属性
 */
export interface TabPanelProps {
  /** 标签 ID */
  id: string;
  /** 子内容 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * TabPanel 标签内容面板组件
 */
export function TabPanel({ id, children, className = '' }: TabPanelProps): ReactNode {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) {
    return null;
  }

  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`pt-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default Tabs;