/**
 * @fileoverview 页面编辑器
 * @description 标题、别名、TipTap 编辑器、SEO 字段、发布开关——复用文章编辑器组件 — Bento + Glassmorphism 风格
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Editor } from '../components/editor/Editor';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Save, Send, ArrowLeft } from 'lucide-react';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
}

interface PageEditorProps {
  pageId?: string;
}

export function PageEditor({ pageId }: PageEditorProps) {
  const isNew = !pageId;
  const [page, setPage] = useState<PageData>({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/admin/pages-cms/${pageId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('获取页面失败');
        const data = await response.json();
        setPage({
          id: data.id,
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          status: data.status || 'draft',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId, isNew]);

  const savePage = useCallback(
    async (isPublish = false) => {
      if (!page.title.trim()) {
        setError('标题不能为空');
        return;
      }

      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const url = isNew ? '/api/admin/pages-cms' : `/api/admin/pages-cms/${page.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: page.title,
            slug: page.slug,
            content: page.content,
            seoTitle: page.seoTitle || undefined,
            seoDescription: page.seoDescription || undefined,
          }),
        });

        if (!response.ok) throw new Error('保存失败');

        const data = await response.json();
        if (isNew && data.id) {
          setPage((prev) => ({ ...prev, id: data.id }));
          window.location.href = `/admin/pages-cms/${data.id}/edit`;
        }
        setSuccessMsg('保存成功');

        if (isPublish && data.id) {
          const pubResponse = await fetch(`/api/admin/pages-cms/${data.id}/publish`, {
            method: 'POST',
            credentials: 'include',
          });
          if (pubResponse.ok) {
            setPage((prev) => ({ ...prev, status: 'published' }));
            setSuccessMsg('页面已发布');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [page, isNew]
  );

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
        <div className="flex items-center gap-3">
          <button className="rounded-md p-1 text-text-secondary transition-colors hover:bg-glass-bg-hover" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">{isNew ? '新建页面' : '编辑页面'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => savePage(false)} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            保存
          </Button>
          {page.status !== 'published' && (
            <Button variant="primary" size="md" onClick={() => savePage(true)} disabled={saving}>
              <Send className="mr-1 h-4 w-4" />
              发布
            </Button>
          )}
        </div>
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">{successMsg}</div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 主编辑区 */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Input
              label="标题"
              value={page.title}
              onChange={(e) => {
                const slug = isNew
                  ? e.target.value.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                  : page.slug;
                setPage((prev) => ({ ...prev, title: e.target.value, slug }));
              }}
              placeholder="页面标题"
            />
          </div>

          <div className="mb-4">
            <Input
              label="URL 别名"
              value={page.slug}
              onChange={(e) => setPage((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="留空则从标题自动生成"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-text-secondary">正文内容</label>
            <Editor
              content={page.content}
              onChange={(content) => setPage((prev) => ({ ...prev, content }))}
              placeholder="开始编辑页面内容..."
            />
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* SEO 设置 */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">SEO 设置</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 标题</label>
                <input
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle px-2 py-1.5 text-sm text-text-primary backdrop-blur focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                  value={page.seoTitle}
                  onChange={(e) => setPage((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="留空则使用页面标题"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 描述</label>
                <textarea
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle px-2 py-1.5 text-sm text-text-primary backdrop-blur focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                  rows={3}
                  value={page.seoDescription}
                  onChange={(e) => setPage((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="搜索引擎展示的描述"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageEditor;
