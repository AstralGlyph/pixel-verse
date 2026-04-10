/**
 * @fileoverview 后台登录页面
 * @description 用户名/密码表单、错误提示、登录成功跳转
 */

import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || '登录失败');
        return;
      }

      window.location.href = '/admin/dashboard';
    } catch {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="glass-card w-full max-w-md rounded-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Admin CMS</h1>
          <p className="mt-2 text-sm text-text-secondary">请登录以继续</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="用户名"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
            required
          />

          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            登录
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
