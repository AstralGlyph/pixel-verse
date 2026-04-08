/**
 * @fileoverview FocusTrap 焦点陷阱组件
 * @description 将键盘焦点限制在指定容器内，用于模态框、对话框等场景
 * @description 符合 WCAG 2.2 AA 级 2.4.3 焦点顺序要求
 * @example
 * <FocusTrap active={isOpen}>
 *   <ModalContent />
 * </FocusTrap>
 */

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

export interface FocusTrapProps {
  /** 是否激活焦点陷阱 */
  active: boolean;
  /** 子元素 */
  children: ReactNode;
  /** 失去焦点时的回调 */
  onDeactivate?: () => void;
  /** 是否允许通过点击外部关闭 */
  clickOutsideDeactivates?: boolean;
}

/**
 * 获取容器内所有可聚焦元素
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]:not([disabled]):not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

export function FocusTrap({
  active,
  children,
  onDeactivate,
  clickOutsideDeactivates = false,
}: FocusTrapProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!active || !containerRef.current) return;

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: 从第一个元素跳到最后一个元素
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: 从最后一个元素跳到第一个元素
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Escape 键关闭
      if (event.key === 'Escape' && onDeactivate) {
        event.preventDefault();
        onDeactivate();
      }
    },
    [active, onDeactivate]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        !active ||
        !clickOutsideDeactivates ||
        !containerRef.current ||
        !onDeactivate
      ) return;

      if (!containerRef.current.contains(event.target as Node)) {
        onDeactivate();
      }
    },
    [active, clickOutsideDeactivates, onDeactivate]
  );

  useEffect(() => {
    if (!active) return;

    // 保存当前活动元素
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 聚焦到容器内的第一个可聚焦元素
    const focusableElements = containerRef.current
      ? getFocusableElements(containerRef.current)
      : [];

    if (focusableElements.length > 0) {
      // 延迟聚焦，确保 DOM 已更新
      requestAnimationFrame(() => {
        focusableElements[0].focus();
      });
    }

    // 添加事件监听
    document.addEventListener('keydown', handleKeyDown);
    if (clickOutsideDeactivates) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (clickOutsideDeactivates) {
        document.removeEventListener('mousedown', handleClickOutside);
      }

      // 恢复之前的焦点
      if (previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, handleKeyDown, handleClickOutside, clickOutsideDeactivates]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
