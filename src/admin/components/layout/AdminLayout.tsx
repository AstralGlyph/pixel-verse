/**
 * @fileoverview 后台管理布局组件（已废弃）
 * @deprecated 此组件已被 AdminLayout.astro + Sidebar.tsx 替代
 * @description 保留此文件仅供参考，后续可删除
 * @description 侧边栏导航、头部用户信息、登出按钮
 */

import React from 'react';
import { useAuthStore } from '../../stores/auth.store';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const navItems = [
  { label: '仪表盘', href: '/admin/dashboard' },
  { label: '文章管理', href: '/admin/posts' },
  { label: '分类管理', href: '/admin/categories' },
  { label: '标签管理', href: '/admin/tags' },
  { label: '媒体库', href: '/admin/media' },
  { label: '页面管理', href: '/admin/pages-admin' },
  { label: '用户管理', href: '/admin/users' },
];

export function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    logout();
    window.location.href = '/admin';
  };

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="flex h-16 items-center border-b border-gray-700 px-6">
          <h1 className="text-lg font-bold">Admin CMS</h1>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center rounded px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col">
        {/* 头部 */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role?.display_name})
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              退出登录
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 min-h-0 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
