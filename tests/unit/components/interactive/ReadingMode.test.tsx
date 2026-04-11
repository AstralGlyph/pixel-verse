/**
 * @fileoverview ReadingMode 组件单元测试
 * @description 测试沉浸式阅读模式的切换和状态保持
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingMode } from '@components/interactive/ReadingMode';

describe('ReadingMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该默认关闭', () => {
    render(<ReadingMode />);
    const button = screen.getByRole('button', { name: /进入阅读模式/ });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('点击应该切换阅读模式', () => {
    render(<ReadingMode />);
    const button = screen.getByRole('button', { name: /进入阅读模式/ });

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', '退出阅读模式');
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', '进入阅读模式');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('应该保持状态到 localStorage', () => {
    localStorage.setItem('reading-mode-active', 'true');
    render(<ReadingMode />);

    const button = screen.getByRole('button', { name: /退出阅读模式/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('应该调用 onChange 回调', () => {
    const onChange = vi.fn();
    render(<ReadingMode onChange={onChange} />);

    const button = screen.getByRole('button', { name: /进入阅读模式/ });
    fireEvent.click(button);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('应该添加 reading-mode class 到 html 元素', () => {
    render(<ReadingMode />);
    const button = screen.getByRole('button', { name: /进入阅读模式/ });

    expect(document.documentElement).not.toHaveClass('reading-mode');

    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('reading-mode');
  });
});
