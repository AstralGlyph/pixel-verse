/**
 * @fileoverview 标签管理页面
 * @description 标签列表、创建、编辑、删除，显示文章数
 */

import React, { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tags', { credentials: 'include' });
      if (!response.ok) throw new Error('获取标签列表失败');
      const data = await response.json();
      setTags(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          slug: formSlug || undefined,
        }),
      });

      if (!response.ok) throw new Error('创建标签失败');

      resetForm();
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setFormName(tag.name);
    setFormSlug(tag.slug);
  };

  const handleUpdate = async (id: string) => {
    if (!formName.trim()) return;

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          slug: formSlug || undefined,
        }),
      });

      if (!response.ok) throw new Error('更新标签失败');

      resetForm();
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    const tag = tags.find((t) => t.id === id);
    if (tag?.postCount && tag.postCount > 0) {
      alert(`该标签被 ${tag.postCount} 篇文章使用，请先移除关联后再删除`);
      return;
    }

    if (!confirm('确定要删除这个标签吗？')) return;

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('删除标签失败');

      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="page-content space-y-4">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">标签管理</h1>
        <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          新建标签
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* 创建表单 */}
      {showCreate && (
        <div className="glass-card rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-text-primary">新建标签</h3>
            <button className="text-text-secondary hover:text-text-primary" onClick={resetForm}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="名称"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="标签名称"
            />
            <Input
              label="URL 别名"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="留空自动生成"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={resetForm}>
              取消
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate}>
              创建
            </Button>
          </div>
        </div>
      )}

      {/* 标签列表 */}
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                URL 别名
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-tertiary">
                文章数
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                  暂无标签
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-glass-bg-hover">
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <input
                        className="w-full rounded border border-glass-border bg-glass-bg-subtle backdrop-blur px-2 py-1 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    ) : (
                      <span className="text-sm font-medium text-text-primary">{tag.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-tertiary">
                    {editingId === tag.id ? (
                      <input
                        className="w-full rounded border border-glass-border bg-glass-bg-subtle backdrop-blur px-2 py-1 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                      />
                    ) : (
                      <span className="font-mono text-xs">/{tag.slug}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-text-secondary">
                    {tag.postCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === tag.id ? (
                        <>
                          <button
                            className="rounded px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10"
                            onClick={() => handleUpdate(tag.id)}
                          >
                            保存
                          </button>
                          <button
                            className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-glass-bg-hover"
                            onClick={resetForm}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="rounded p-1 text-text-secondary hover:text-accent-primary"
                            title="编辑"
                            onClick={() => handleEdit(tag)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded p-1 text-error/80 hover:text-error"
                            title="删除"
                            onClick={() => handleDelete(tag.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
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

export default TagsPage;
