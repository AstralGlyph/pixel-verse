/**
 * @fileoverview 分类管理页面
 * @description 分类列表、创建、编辑、删除，显示文章数
 */

import React, { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' });
      if (!response.ok) throw new Error('获取分类列表失败');
      const data = await response.json();
      setCategories(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          slug: formSlug || undefined,
          description: formDescription || undefined,
        }),
      });

      if (!response.ok) throw new Error('创建分类失败');

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
  };

  const handleUpdate = async (id: string) => {
    if (!formName.trim()) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          slug: formSlug || undefined,
          description: formDescription || undefined,
        }),
      });

      if (!response.ok) throw new Error('更新分类失败');

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category?.postCount && category.postCount > 0) {
      alert(`该分类下有 ${category.postCount} 篇文章，请先重新分配文章后再删除`);
      return;
    }

    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('删除分类失败');

      fetchCategories();
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
        <h1 className="text-2xl font-bold text-text-primary">分类管理</h1>
        <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          新建分类
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-text-primary">新建分类</h3>
            <button className="text-text-secondary hover:text-text-primary" onClick={resetForm}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="名称"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="分类名称"
            />
            <Input
              label="URL 别名"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="留空自动生成"
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-text-secondary">描述</label>
            <textarea
              className="w-full rounded-lg border border-glass-border bg-glass-bg-subtle backdrop-blur-sm p-2 text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="分类描述（可选）"
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

      {/* 分类列表 */}
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                描述
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">
                  暂无分类
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-glass-bg-hover">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        className="w-full rounded border border-glass-border bg-glass-bg-subtle backdrop-blur-sm px-2 py-1 text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    ) : (
                      <span className="text-sm font-medium text-text-primary">{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-tertiary">
                    {editingId === category.id ? (
                      <input
                        className="w-full rounded border border-glass-border bg-glass-bg-subtle backdrop-blur-sm px-2 py-1 text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                      />
                    ) : (
                      <span className="font-mono text-xs">/{category.slug}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {editingId === category.id ? (
                      <input
                        className="w-full rounded border border-glass-border bg-glass-bg-subtle backdrop-blur-sm px-2 py-1 text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    ) : (
                      category.description || '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-text-secondary">
                    {category.postCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            className="rounded px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10"
                            onClick={() => handleUpdate(category.id)}
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
                            onClick={() => handleEdit(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded p-1 text-error/80 hover:text-error"
                            title="删除"
                            onClick={() => handleDelete(category.id)}
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

export default CategoriesPage;
