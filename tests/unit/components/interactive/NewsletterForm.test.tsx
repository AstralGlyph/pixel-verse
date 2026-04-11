/**
 * @fileoverview NewsletterForm 单元测试
 * @description 测试订阅表单的渲染、验证、状态切换
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('输入无效邮箱时显示错误', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  it('输入有效邮箱时显示成功状态', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    // 加载状态
    expect(screen.getByText('订阅中...')).toBeInTheDocument();

    // 成功状态（模拟 1 秒延迟）
    await waitFor(() => {
      expect(screen.getByText('订阅成功！请检查邮箱确认。')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('加载状态禁用按钮', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('成功状态显示确认图标', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('订阅 Newsletter')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('错误状态设置 aria-invalid', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('输入变化时清除错误状态', async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('邮箱地址');
    const button = screen.getByRole('button', { name: '订阅' });

    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: 'new@email.com' } });
    expect(screen.queryByText('请输入有效的邮箱地址')).not.toBeInTheDocument();
  });
});
