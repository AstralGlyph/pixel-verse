/**
 * @fileoverview 设置页面
 * @description 修改自己的密码、更新个人资料、系统信息 — Bento + Glassmorphism 风格
 */

import React, { useState, useEffect } from 'react';
import { Save, User, Key, Info } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: { name: string; displayName: string } | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'system'>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 修改密码表单
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 个人资料表单
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setUsername(data.data.username);
        setEmail(data.data.email);
      }
    } catch (err) {
      setError('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    if (!currentPassword) {
      setError('请输入当前密码');
      return;
    }

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('密码已修改');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error?.message || '修改密码失败');
      }
    } catch (err) {
      setError('修改密码失败，请重试');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('个人资料已更新');
        setUser({ ...user, username, email });
      } else {
        setError(data.message || '更新失败');
      }
    } catch (err) {
      setError('更新失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">加载中...</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto page-content">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">设置</h1>
        <p className="text-text-secondary mt-1">管理个人资料和系统设置</p>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-lg">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 border border-success/30 bg-success/10 text-success rounded-lg">{success}</div>
      )}

      {/* 选项卡 */}
      <div className="flex gap-4 mb-6 border-b border-glass-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-fast rounded-t-md ${
            activeTab === 'profile'
              ? 'border-accent-primary text-accent-primary bg-glass-bg-subtle'
              : 'border-transparent text-text-primary hover:text-accent-primary hover:bg-glass-bg-hover'
          }`}
        >
          <User size={18} />
          个人资料
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-fast rounded-t-md ${
            activeTab === 'password'
              ? 'border-accent-primary text-accent-primary bg-glass-bg-subtle'
              : 'border-transparent text-text-primary hover:text-accent-primary hover:bg-glass-bg-hover'
          }`}
        >
          <Key size={18} />
          修改密码
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-fast rounded-t-md ${
            activeTab === 'system'
              ? 'border-accent-primary text-accent-primary bg-glass-bg-subtle'
              : 'border-transparent text-text-primary hover:text-accent-primary hover:bg-glass-bg-hover'
          }`}
        >
          <Info size={18} />
          系统信息
        </button>
      </div>

      {/* 个人资料 */}
      {activeTab === 'profile' && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">个人资料</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">角色</label>
              <input
                type="text"
                value={user?.role?.displayName || '无'}
                disabled
                className="w-full border border-glass-border bg-glass-bg-subtle/50 rounded-md px-3 py-2 text-text-tertiary cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Save size={18} />
              保存修改
            </button>
          </form>
        </div>
      )}

      {/* 修改密码 */}
      {activeTab === 'password' && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">修改密码</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">当前密码</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Key size={18} />
              修改密码
            </button>
          </form>
        </div>
      )}

      {/* 系统信息 */}
      {activeTab === 'system' && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">系统信息</h2>
          <dl className="space-y-4">
            {[
              ['系统名称', 'Pixel Verse CMS'],
              ['技术栈', 'Astro 5.x + React 18 + Drizzle ORM + Better SQLite3'],
              ['Node.js 版本', '20 LTS'],
              ['数据库', 'SQLite (Better SQLite3)'],
              ['富文本编辑器', 'TipTap (ProseMirror)'],
              ['认证方式', 'Session + HTTP-only Cookie'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-glass-border-subtle">
                <dt className="text-sm font-medium text-text-tertiary">{label}</dt>
                <dd className="text-sm text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
