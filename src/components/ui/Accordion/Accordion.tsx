/**
 * @fileoverview Accordion 折叠组件
 * @description 可折叠内容块，支持单开或多开模式
 */

import { type ReactNode, createContext, useContext, useState, useCallback } from 'react';

/**
 * Accordion 上下文
 */
interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/**
 * 使用 Accordion 上下文
 */
function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
}

/**
 * Accordion 容器组件属性
 */
export interface AccordionProps {
  /** 子内容 */
  children: ReactNode;
  /** 开启模式：single 单开，multiple 多开 */
  type?: 'single' | 'multiple';
  /** 默认展开的项 ID */
  defaultOpen?: string | string[];
  /** 额外类名 */
  className?: string;
}

/**
 * Accordion 容器组件
 */
export function Accordion({
  children,
  type = 'single',
  defaultOpen = [],
  className = '',
}: AccordionProps): ReactNode {
  // 初始化展开项
  const initialOpen = Array.isArray(defaultOpen)
    ? new Set(defaultOpen)
    : new Set([defaultOpen]);

  const [openItems, setOpenItems] = useState<Set<string>>(initialOpen);

  const toggleItem = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          if (type === 'single') {
            newSet.clear();
          }
          newSet.add(id);
        }
        return newSet;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={`my-6 divide-y divide-border rounded-lg border border-border ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/**
 * AccordionItem 组件属性
 */
export interface AccordionItemProps {
  /** 唯一 ID */
  id: string;
  /** 子内容 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * AccordionItem 折叠项组件
 */
export function AccordionItem({
  id,
  children,
  className = '',
}: AccordionItemProps): ReactNode {
  return (
    <div className={className} data-accordion-item={id}>
      {children}
    </div>
  );
}

/**
 * AccordionTrigger 组件属性
 */
export interface AccordionTriggerProps {
  /** 对应的 AccordionItem ID */
  id: string;
  /** 触发器标题 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * AccordionTrigger 触发器组件
 */
export function AccordionTrigger({
  id,
  children,
  className = '',
}: AccordionTriggerProps): ReactNode {
  const { openItems, toggleItem } = useAccordionContext();
  const isOpen = openItems.has(id);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${id}`}
      onClick={() => toggleItem(id)}
      className={`
        flex w-full items-center justify-between p-4
        text-left font-medium text-text-primary
        hover:bg-bg-secondary transition-colors
        ${className}
      `}
    >
      <span>{children}</span>
      <svg
        className={`h-5 w-5 text-text-secondary transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

/**
 * AccordionContent 组件属性
 */
export interface AccordionContentProps {
  /** 对应的 AccordionItem ID */
  id: string;
  /** 内容 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * AccordionContent 内容组件
 */
export function AccordionContent({
  id,
  children,
  className = '',
}: AccordionContentProps): ReactNode {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.has(id);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id={`accordion-content-${id}`}
      role="region"
      className={`
        px-4 pb-4 pt-0 text-text-secondary
        animate-accordion-down
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Accordion;