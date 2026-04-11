/**
 * @fileoverview Callout 提示框组件
 * @description 样式化提示框，支持 info、warn、error、tip 四种类型
 */

import { type ReactNode } from 'react';

/**
 * Callout 类型定义
 */
export type CalloutType = 'info' | 'warn' | 'error' | 'tip';

/**
 * Callout 组件属性
 */
export interface CalloutProps {
  /** 提示类型 */
  type?: CalloutType;
  /** 可选标题 */
  title?: string;
  /** 子内容 */
  children: ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * 类型对应的图标
 */
const icons: Record<CalloutType, ReactNode> = {
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warn: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  tip: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707m0 11.314l.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m0 11.314l.707.707m4.657-9.657a4 4 0 114.243 4.243M9 17v1a3 3 0 006 0v-1"
      />
    </svg>
  ),
};

/**
 * 类型对应的样式类
 */
const typeStyles: Record<CalloutType, string> = {
  info: 'bg-info-bg border-info-border text-info-text',
  warn: 'bg-warn-bg border-warn-border text-warn-text',
  error: 'bg-error-bg border-error-border text-error-text',
  tip: 'bg-tip-bg border-tip-border text-tip-text',
};

/**
 * Callout 提示框组件
 * @param props - 组件属性
 * @returns 提示框 JSX 元素
 */
export function Callout({
  type = 'info',
  title,
  children,
  className = '',
}: CalloutProps): ReactNode {
  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${typeStyles[type]} ${className}`}
      role={type === 'info' ? 'note' : 'alert'}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm leading-relaxed [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Callout;