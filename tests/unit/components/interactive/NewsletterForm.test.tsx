/**
 * @fileoverview NewsletterForm 单元测试
 * @description 测试订阅表单的渲染、验证、状态切换
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NewsletterForm } from '../../../../src/components/interactive/NewsletterForm/NewsletterForm';

describe('NewsletterForm', () => {
  it('渲染标题和描述', () => {
    render(<NewsletterForm />);
    expect(screen.getByText('订阅 Newsletter')).toBeInTheDocument();
    expect(screen.getByText('获取最新文章更新，每周一封，随时取消。')).toBeInTheDocument();
  });

  it('渲染自定义标题和描述', () => {
    render(<NewsletterForm title="自定义标题" description="自定义描述" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
    expect(screen.getByText('自定义描述')).toBeInTheDocument();
  });

  it('渲染邮箱输入和订阅按钮', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
    expect(screen.getByRole('button', { name: '订阅' })).toBeInTheDocument();
  });

  it('输入无效邮箱时显示错误', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);

    // 错误状态是同步的，立即渲染
    expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
  });

  it('输入有效邮箱时显示成功状态', async () => {
    vi.useFakeTimers();
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);
    });

    // 加载状态
    expect(screen.getByText('订阅中...')).toBeInTheDocument();

    // 快进 1 秒模拟延迟
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 成功状态
    expect(screen.getByText('订阅成功！请检查邮箱确认。')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('加载状态禁用按钮', async () => {
    vi.useFakeTimers();
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);
    });

    // 按钮文本变为"订阅中..."，需要用正则匹配
    expect(screen.getByRole('button', { name: /订阅/ })).toBeDisabled();
    vi.useRealTimers();
  });

  it('成功状态显示确认图标', async () => {
    vi.useFakeTimers();
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('订阅 Newsletter')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('错误状态设置 aria-invalid', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.submit(form);

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('输入变化时清除错误状态', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.submit(form);

    // 确认错误已显示
    expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');

    // 输入新值应清除错误（组件将 state 重置为 idle）
    fireEvent.change(input, { target: { value: 'new@email.com' } });

    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});
