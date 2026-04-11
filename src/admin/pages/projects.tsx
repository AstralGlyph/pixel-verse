/**
 * @fileoverview 后台项目列表页
 */

import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Plus, Edit2, Trash2, Send, RotateCcw, Archive, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: number;
  description?: string;
  author?: { username: string };
  tags?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (page: number, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.perPage),
      });
      if (status) params.set('status', status);

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('获取项目列表失败');

      const data = await response.json();
      setProjects(data.data.data);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    fetchProjects(1, status || undefined);
  };

  const handlePageChange = (page: number) => {
    fetchProjects(page, statusFilter || undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return;

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('删除失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('确定要发布这个项目吗？')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('发布失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm('确定要取消发布吗？项目将被归档。')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('取消发布失败');
      fetchProjects(pagination.page, statusFilter || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消发布失败');
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('确定要恢复这个项目吗？项目将恢复为草稿状态。')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}/restore`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('恢复失败');
      fetchProjects(pagination.page, statusFilter || undefined);
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
        <h1 className="text-2xl font-bold text-text-primary">项目管理</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => (window.location.href = '/admin/projects/new')}
        >
          <Plus className="mr-1 h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="glass-subtle flex items-center gap-2 rounded-lg border p-3 backdrop-blur">
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

      {/* 项目表格 */}
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                项目名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                推荐
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                更新时间
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">
                  暂无项目
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary">{project.title}</div>
                    <div className="text-xs text-text-tertiary">/{project.slug}</div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(project.status)}</td>
                  <td className="px-4 py-3">
                    {project.featured ? <Star className="h-4 w-4 text-yellow-400" /> : <span className="text-text-tertiary">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {project.status === 'draft' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="发布"
                          onClick={() => handlePublish(project.id)}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {project.status === 'published' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-warning"
                          title="取消发布"
                          onClick={() => handleUnpublish(project.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      {project.status === 'archived' && (
                        <button
                          className="rounded p-1 text-text-secondary transition-colors hover:text-success"
                          title="恢复"
                          onClick={() => handleRestore(project.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
                        title="编辑"
                        onClick={() => (window.location.href = `/admin/projects/${project.id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-error/80 transition-colors hover:text-error"
                        title="删除"
                        onClick={() => handleDelete(project.id)}
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
            共 {pagination.total} 个项目，第 {pagination.page}/{pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              上一页
            </button>
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
