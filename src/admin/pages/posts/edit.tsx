/**
 * @fileoverview 文章编辑页面
 * @description 标题输入、别名输入、TipTap 编辑器、SEO 字段、状态选择器、保存/发布按钮、自动保存
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Editor } from '../../components/editor/Editor';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Outline } from '../../components/common/Outline';
import { Save, Send, Eye, ArrowLeft, Settings } from 'lucide-react';
import { SettingsDrawer } from '../../components/editor/SettingsDrawer';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PostData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageId: string;
  status: 'draft' | 'published' | 'archived';
  categoryId: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface EditPageProps {
  postId?: string;
}

export function PostEditPage({ postId }: EditPageProps) {
  const isNew = !postId;
  const [post, setPost] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImageId: '',
    status: 'draft',
    categoryId: '',
    tagIds: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const _newTagName = useState('')[0];
  const [showSettings, setShowSettings] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 自动保存
  const { startAutoSave, stopAutoSave, lastSavedAt, isDirty } = useAutoSave({
    delay: 3000,
    onSave: async (content) => {
      await savePost(content as PostData, true);
    },
  });

  // 加载分类和标签
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/admin/categories', { credentials: 'include' }),
          fetch('/api/admin/tags', { credentials: 'include' }),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories((catData.data || catData || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          setTags((tagData.data || tagData || []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })));
        }
      } catch {
        // 分类/标签加载失败不影响编辑
      }
    };
    fetchOptions();
  }, []);

  // 加载已有文章
  useEffect(() => {
    if (isNew) {
      setLoading(false);
      titleInputRef.current?.focus();
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('获取文章失败');
        const data = await response.json();
        const post = data.data || data;
        setPost({
          id: post.id,
          title: post.title || '',
          slug: post.slug || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          coverImageId: post.coverImageId || '',
          status: post.status || 'draft',
          categoryId: post.categoryId || '',
          tagIds: (post.tags || []).map((t: { id: string }) => t.id),
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          seoKeywords: post.seoKeywords || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, isNew]);

  // 启动自动保存
  useEffect(() => {
    if (!loading) {
      startAutoSave(post);
    }
    return () => stopAutoSave();
  }, [loading]);

  // ESC 键关闭抽屉 / Ctrl+Cmd+, 打开设置
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',' && !showSettings) {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings]);

  // 标题变更时自动生成 slug
  const handleTitleChange = (title: string) => {
    const newSlug = isNew
      ? title
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : post.slug;
    setPost((prev) => ({ ...prev, title, slug: newSlug }));
  };

  // 保存文章
  const savePost = useCallback(
    async (postData: PostData, isAutoSave = false) => {
      if (!postData.title.trim()) {
        if (!isAutoSave) setError('标题不能为空');
        return;
      }

      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const url = isNew ? '/api/admin/posts' : `/api/admin/posts/${postData.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postData.title,
            slug: postData.slug,
            content: postData.content,
            excerpt: postData.excerpt,
            coverImageId: postData.coverImageId || undefined,
            categoryId: postData.categoryId || undefined,
            tagIds: postData.tagIds.length > 0 ? postData.tagIds : undefined,
            seoTitle: postData.seoTitle || undefined,
            seoDescription: postData.seoDescription || undefined,
            seoKeywords: postData.seoKeywords || undefined,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || '保存失败');
        }

        const data = await response.json();
        const result = data.data || data;
        if (isNew && result.id) {
          setPost((prev) => ({ ...prev, id: result.id }));
          // 新建文章后跳转到编辑页面
          window.location.href = `/admin/posts/${result.id}/edit`;
        }
        if (!isAutoSave) {
          setSuccessMsg('保存成功');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [isNew]
  );

  // 发布文章
  const handlePublish = async () => {
    if (!post.id) {
      // 先保存再发布
      await savePost(post);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${post.id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('发布失败');

      setPost((prev) => ({ ...prev, status: 'published' }));
      setSuccessMsg('文章已发布');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSaving(false);
    }
  };

  // 取消发布
  const handleUnpublish = async () => {
    if (!post.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${post.id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('操作失败');

      setPost((prev) => ({ ...prev, status: 'draft' }));
      setSuccessMsg('已取消发布');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSaving(false);
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
    <div className="space-y-4 page-content">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-1 text-text-secondary transition-colors hover:bg-glass-bg-hover"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isNew ? '新建文章' : '编辑文章'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {lastSavedAt && (
            <span className="text-xs text-text-tertiary">
              {isDirty ? '未保存' : `已保存 ${lastSavedAt.toLocaleTimeString('zh-CN')}`}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            设置
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => savePost(post)}
            disabled={saving}
          >
            <Save className="mr-1 h-4 w-4" />
            保存草稿
          </Button>
          {post.status === 'published' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={handleUnpublish}
              disabled={saving}
            >
              取消发布
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handlePublish}
              disabled={saving}
            >
              <Send className="mr-1 h-4 w-4" />
              发布
            </Button>
          )}
          {post.id && post.status === 'published' && (
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-2 text-sm text-text-primary backdrop-blur hover:bg-glass-bg-hover transition-all duration-fast"
              onClick={() => window.open(`/blog/ssr/${post.slug}`, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          {successMsg}
        </div>
      )}

      {/* 编辑器 + 右侧面板 */}
      <div className="flex items-start gap-4">
        {/* 左侧：编辑器区域 */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* 标题 */}
          <Input
            label="标题"
            value={post.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="请输入文章标题"
            ref={titleInputRef}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* URL 别名 */}
            <Input
              label="URL 别名"
              value={post.slug}
              onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="留空则从标题自动生成"
            />

            {/* 摘要 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">摘要</label>
              <textarea
                className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur p-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                rows={3}
                value={post.excerpt}
                onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="文章摘要（可选）"
              />
            </div>
          </div>

          {/* 富文本编辑器 */}
          <div className="max-w-4xl mx-auto w-full">
            <label className="mb-2 block text-sm font-medium text-text-secondary">正文内容</label>
            <Editor
              content={post.content}
              onChange={(content) => setPost((prev) => ({ ...prev, content }))}
              placeholder="开始写作..."
            />
          </div>
        </div>

        {/* 右侧面板：大纲 + 设置抽屉 */}
        <div
          className={`shrink-0 transition-all duration-normal ${
            showSettings ? 'w-[200px]' : 'w-[280px]'
          } lg:sticky lg:top-20`}
        >
          <Outline content={post.content} />
        </div>
      </div>

      {/* 设置抽屉 */}
      <SettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{
          status: post.status,
          categoryId: post.categoryId,
          tagIds: post.tagIds,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          seoKeywords: post.seoKeywords,
        }}
        onSettingsChange={(partial) => setPost((prev) => ({ ...prev, ...partial }))}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}

export default PostEditPage;
