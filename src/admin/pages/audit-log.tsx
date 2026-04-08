/**
 * @fileoverview 审计日志查看页面
 * @description 可筛选的最近操作列表（仅超级管理员）— Bento + Glassmorphism 风格
 */

import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { username: string; email: string };
}

const ACTION_LABELS: Record<string, string> = {
  'user.created': '创建用户',
  'user.deleted': '删除用户',
  'user.updated': '更新用户',
  'password.reset': '重置密码',
  'post.created': '创建文章',
  'post.updated': '更新文章',
  'post.deleted': '删除文章',
  'post.published': '发布文章',
  'post.unpublished': '取消发布',
  'page.created': '创建页面',
  'page.updated': '更新页面',
  'page.deleted': '删除页面',
  'page.published': '发布页面',
  'page.unpublished': '取消发布页面',
  'media.uploaded': '上传媒体',
  'media.deleted': '删除媒体',
  'category.created': '创建分类',
  'category.updated': '更新分类',
  'category.deleted': '删除分类',
  'tag.created': '创建标签',
  'tag.updated': '更新标签',
  'tag.deleted': '删除标签',
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  user: '用户',
  post: '文章',
  page: '页面',
  media: '媒体',
  category: '分类',
  tag: '标签',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [filterTargetType, setFilterTargetType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterTargetType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });
      if (filterAction) params.set('action', filterAction);
      if (filterTargetType) params.set('targetType', filterTargetType);

      const res = await fetch(`/api/admin/audit-log?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error('获取审计日志失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilterAction('');
    setFilterTargetType('');
    setPage(1);
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'border-green-500/30 bg-green-500/10 text-green-400';
    if (action.includes('deleted')) return 'border-error/30 bg-error/10 text-error';
    if (action.includes('published')) return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    if (action.includes('unpublished')) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    if (action.includes('updated') || action.includes('reset')) return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
    return 'border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">加载中...</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto page-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">审计日志</h1>
          <p className="text-text-secondary mt-1">查看系统关键操作记录</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-glass-border rounded-md bg-glass-bg backdrop-blur text-text-primary hover:bg-glass-bg-hover transition-all duration-fast"
        >
          <Filter size={18} />
          筛选
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">操作类型</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <option value="">全部</option>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">目标类型</label>
              <select
                value={filterTargetType}
                onChange={(e) => setFilterTargetType(e.target.value)}
                className="border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <option value="">全部</option>
                {Object.entries(TARGET_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="px-4 py-2 text-white rounded-md hover:scale-[1.02] transition-all duration-normal ease-spring"
                style={{ background: 'var(--gradient-primary)' }}
              >
                应用
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border-2 border-glass-border rounded-md text-text-primary hover:bg-glass-bg-hover transition-all duration-fast"
              >
                清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日志列表 */}
      <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
        <div className="px-6 py-3 bg-glass-bg-subtle border-b border-glass-border text-sm text-text-secondary">
          共 {total} 条记录
        </div>
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">操作人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">操作</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">目标</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {logs.map(log => (
              <tr key={log.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {log.user?.username || '未知'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(log.action)}`}>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {TARGET_TYPE_LABELS[log.targetType] || log.targetType}
                  {log.targetId && (
                    <span className="ml-1 text-xs text-text-tertiary/60 font-mono">{log.targetId.slice(0, 8)}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary font-mono">
                  {log.ipAddress || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-text-tertiary">暂无审计日志</div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-glass-border flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border-2 border-glass-border rounded-md bg-glass-bg text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-glass-bg-hover transition-all duration-fast"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border-2 border-glass-border rounded-md bg-glass-bg text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-glass-bg-hover transition-all duration-fast"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
