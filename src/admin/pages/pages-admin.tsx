/**
 * @fileoverview 页面管理页面
 * @description 静态页面列表、状态标签、创建/编辑/删除操作 — Bento + Glassmorphism 风格
 */

import React, { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Plus, Edit2, Trash2, Send } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export function PagesAdminPage() {
  const [pageList, setPageList] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pages-cms', { credentials: 'include' });
      if (!response.ok) throw new Error('获取页面列表失败');
      const data = await response.json();
      setPageList(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个页面吗？')) return;

    try {
      const response = await fetch(`/api/admin/pages-cms/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('删除页面失败');

      fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/pages-cms/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('操作失败');

      fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary',
      published: 'border-green-500/30 bg-green-500/10 text-green-400',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      published: '已发布',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-content">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">页面管理</h1>
        <Button variant="primary" size="md" onClick={() => window.location.href = '/admin/pages-cms/new'}>
          <Plus className="mr-1 h-4 w-4" />
          新建页面
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      {/* 页面列表 */}
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">标题</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">URL 别名</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">更新时间</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {pageList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">暂无页面</td>
              </tr>
            ) : (
              pageList.map((page) => (
                <tr key={page.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{page.title}</td>
                  <td className="px-4 py-3 text-sm text-text-tertiary font-mono">/{page.slug}</td>
                  <td className="px-4 py-3">{getStatusBadge(page.status)}</td>
                  <td className="px-4 py-3 text-sm text-text-tertiary">
                    {new Date(page.updatedAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {page.status === 'draft' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="发布"
                          onClick={() => handlePublish(page.id)}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
                        title="编辑"
                        onClick={() => window.location.href = `/admin/pages-cms/${page.id}/edit`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-error/80 transition-colors hover:text-error"
                        title="删除"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PagesAdminPage;
