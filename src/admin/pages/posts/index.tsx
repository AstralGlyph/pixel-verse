/**
 * @fileoverview 文章列表页面
 * @description 表格视图、状态标签、筛选控件、分页、新建/编辑/删除操作 — Bento + Glassmorphism 风格
 */

import { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Plus, Edit2, Trash2, Eye, Filter, Send, RotateCcw, Archive } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt: string | null;
  author: { id: string; username: string };
  category: { id: string; name: string } | null;
  tags: Array<{ id: string; name: string }>;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (page: number, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.perPage),
      });
      if (status) params.set('status', status);

      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }

      const data = await response.json();
      setPosts(data.data.data);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(pagination.page, statusFilter || undefined);
  }, []);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    fetchPosts(1, status || undefined);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, statusFilter || undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('删除文章失败');
      }

      fetchPosts(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('确定要发布这篇文章吗？')) return;

    try {
      const response = await fetch(`/api/admin/posts/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('发布失败');
      fetchPosts(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm('确定要取消发布吗？文章将被归档。')) return;

    try {
      const response = await fetch(`/api/admin/posts/${id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('取消发布失败');
      fetchPosts(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消发布失败');
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!confirm('确定要恢复这篇文章吗？文章将恢复为草稿状态。')) return;

    try {
      const response = await fetch(`/api/admin/posts/${id}/unarchive`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('恢复失败');
      fetchPosts(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '恢复失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary',
      published: 'border-green-500/30 bg-green-500/10 text-green-400',
      archived: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  const filterBtnBase = 'rounded-md px-3 py-1 text-sm font-medium transition-all duration-fast';
  const filterBtnActive = 'bg-bg-secondary text-accent-primary border-2 border-accent-primary/50';
  const filterBtnInactive = 'text-text-primary hover:bg-glass-bg-hover';

  return (
    <div className="space-y-4">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">文章管理</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.href = '/admin/posts/new'}
        >
          <Plus className="mr-1 h-4 w-4" />
          新建文章
        </Button>
      </div>

      {/* 筛选控件 */}
      <div className="glass-subtle flex items-center gap-2 rounded-lg border p-3 backdrop-blur">
        <Filter className="h-4 w-4 text-text-tertiary" />
        <span className="text-sm text-text-secondary">状态筛选：</span>
        <button
          className={`${filterBtnBase} ${!statusFilter ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('')}
        >
          全部
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'draft' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('draft')}
        >
          草稿
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'published' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('published')}
        >
          已发布
        </button>
        <button
          className={`${filterBtnBase} ${statusFilter === 'archived' ? filterBtnActive : filterBtnInactive}`}
          onClick={() => handleStatusChange('archived')}
        >
          已归档
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* 文章表格 */}
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                标题
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                分类
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                作者
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                发布时间
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  暂无文章
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary">{post.title}</div>
                    <div className="text-xs text-text-tertiary">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {post.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {post.author?.username || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {post.status === 'published' ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'published' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
                          title="预览"
                          onClick={() => window.open(`/blog/${encodeURIComponent(post.slug)}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {post.status === 'draft' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="发布"
                          onClick={() => handlePublish(post.id)}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {post.status === 'published' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-warning"
                          title="取消发布"
                          onClick={() => handleUnpublish(post.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      {post.status === 'archived' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="恢复"
                          onClick={() => handleUnarchive(post.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
                        title="编辑"
                        onClick={() => window.location.href = `/admin/posts/${post.id}/edit`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-error/80 transition-colors hover:text-error"
                        title="删除"
                        onClick={() => handleDelete(post.id)}
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

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            共 {pagination.total} 篇文章，第 {pagination.page}/{pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              上一页
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`rounded-md border-2 px-3 py-1 text-sm font-medium transition-all duration-fast ${
                    pagination.page === pageNum
                      ? 'border-accent-primary text-white'
                      : 'border-glass-border bg-glass-bg text-text-primary backdrop-blur hover:bg-glass-bg-hover'
                  }`}
                  style={pagination.page === pageNum ? { background: 'var(--gradient-primary)' } : undefined}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsListPage;
