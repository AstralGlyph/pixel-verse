/**
 * @fileoverview Newsletter 订阅表单组件
 * @description 允许读者通过邮箱订阅 Newsletter
 * @example
 * <NewsletterForm />
 */

import { useState, type ReactNode } from 'react';

export interface NewsletterFormProps {
  /** 订阅 API 端点 */
  endpoint?: string;
  /** 标题文字 */
  title?: string;
  /** 描述文字 */
  description?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

/**
 * NewsletterForm 订阅表单组件
 */
export function NewsletterForm({
  endpoint = '/api/subscribe',
  title = '订阅 Newsletter',
  description = '获取最新文章更新，每周一封，随时取消。',
}: NewsletterFormProps): ReactNode {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setState('error');
      setMessage('请输入有效的邮箱地址');
      return;
    }

    setState('loading');

    try {
      // 实际使用时替换为真实的 API 调用
      // const response = await fetch(endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error('订阅失败');

      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState('success');
      setMessage('订阅成功！请检查邮箱确认。');
      setEmail('');
    } catch {
      setState('error');
      setMessage('订阅失败，请稍后重试。');
    }
  };

  if (state === 'success') {
    return (
      <div className="p-6 bg-bg-secondary rounded-xl border border-border">
        <div className="text-center">
          <svg
            className="h-12 w-12 text-accent mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <p className="text-text-secondary mt-1">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-text-secondary text-sm mt-1">{description}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          邮箱地址
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
          placeholder="your@email.com"
          className={`
            flex-1 px-4 py-2.5 rounded-lg bg-bg border text-text-primary placeholder-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-accent transition-colors
            ${state === 'error' ? 'border-red-500' : 'border-border'}
          `}
          disabled={state === 'loading'}
          aria-describedby={state !== 'idle' ? 'newsletter-message' : undefined}
          aria-invalid={state === 'error'}
          required
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              订阅中...
            </span>
          ) : (
            '订阅'
          )}
        </button>
      </form>

      {message && (
        <p
          id="newsletter-message"
          className={`mt-2 text-sm ${state === 'error' ? 'text-red-500' : 'text-text-tertiary'}`}
          role={state === 'error' ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default NewsletterForm;
