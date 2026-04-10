/**
 * @fileoverview 后台项目编辑页
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Outline } from '../../components/common/Outline';
import { Editor } from '../../components/editor/Editor';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { SettingsDrawer } from '../../components/editor/SettingsDrawer';
import type { PostStatus } from '../../types';

interface TagOption {
  id: string;
  name: string;
}

interface ProjectData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  demoUrl: string;
  sourceUrl: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
  status: PostStatus;
  featured: boolean;
}

interface EditPageProps {
  projectId?: string;
}

interface SettingsChanges {
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export function ProjectEditPage({ projectId }: EditPageProps) {
  const isNew = !projectId;
  const [project, setProject] = useState<ProjectData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    demoUrl: '',
    sourceUrl: '',
    tagIds: [],
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    featured: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 加载标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/admin/tags', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTags((data.data || data || []).map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch {
        // 加载失败不影响编辑
      }
    };
    fetchTags();
  }, []);

  // 加载已有项目
  useEffect(() => {
    if (isNew) {
      setLoading(false);
      titleInputRef.current?.focus();
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('获取项目失败');
        const data = await response.json();
        const p = data.data || data;
        setProject({
          id: p.id,
          title: p.title || '',
          slug: p.slug || '',
          description: p.description || '',
          content: p.content || '',
          demoUrl: p.demoUrl || '',
          sourceUrl: p.sourceUrl || '',
          tagIds: (p.tags || []).map((t: { id: string }) => t.id),
          seoTitle: p.seoTitle || '',
          seoDescription: p.seoDescription || '',
          status: p.status || 'draft',
          featured: !!p.featured,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, isNew]);

  // 标题变更时自动生成 slug
  const handleTitleChange = (title: string) => {
    const newSlug = isNew
      ? title
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : project.slug;
    setProject((prev) => ({ ...prev, title, slug: newSlug }));
  };

  // 保存项目
  const saveProject = useCallback(
    async (postData: ProjectData) => {
      if (!postData.title.trim()) {
        setError('标题不能为空');
        return;
      }

      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${postData.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postData.title,
            slug: postData.slug,
            description: postData.description,
            content: postData.content,
            demoUrl: postData.demoUrl || undefined,
            sourceUrl: postData.sourceUrl || undefined,
            tagIds: postData.tagIds.length > 0 ? postData.tagIds : undefined,
            seoTitle: postData.seoTitle || undefined,
            seoDescription: postData.seoDescription || undefined,
            featured: postData.featured,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || '保存失败');
        }

        const data = await response.json();
        const result = data.data || data;
        if (isNew && result.id) {
          setProject((prev) => ({ ...prev, id: result.id }));
          window.location.href = `/admin/projects/${result.id}/edit`;
        } else {
          setSuccessMsg('保存成功');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [isNew],
  );

  // 发布
  const handlePublish = async () => {
    if (!project.id) {
      await saveProject(project);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/projects/${project.id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('发布失败');

      setProject((prev) => ({ ...prev, status: 'published' }));
      setSuccessMsg('项目已发布');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSaving(false);
    }
  };

  // 取消发布
  const handleUnpublish = async () => {
    if (!project.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/projects/${project.id}/unpublish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('操作失败');

      setProject((prev) => ({ ...prev, status: 'draft' }));
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
            {isNew ? '新建项目' : '编辑项目'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => saveProject(project)}
            disabled={saving}
          >
            <Save className="mr-1 h-4 w-4" />
            保存草稿
          </Button>
          {project.status === 'published' ? (
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

      {/* 表单 + 编辑器 */}
      <div className="flex items-start gap-4 min-w-0">
        {/* 左侧：表单 */}
        <div className="min-w-0 flex-1 space-y-4">
          <Input
            label="项目名称"
            value={project.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
            placeholder="请输入项目名称"
            ref={titleInputRef}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Slug"
              value={project.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProject((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="留空则从标题自动生成"
            />
            <Input
              label="一句话简介"
              value={project.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProject((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="简短描述你的项目"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="在线演示 URL"
              value={project.demoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProject((prev) => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://..."
            />
            <Input
              label="源码 URL"
              value={project.sourceUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProject((prev) => ({ ...prev, sourceUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </div>

          {/* 推荐选项 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(e) => setProject((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-glass-border bg-glass-bg-subtle text-accent-primary focus:ring-accent-primary/30"
            />
            <span className="text-sm text-text-secondary">设为推荐项目</span>
          </label>

          {/* 富文本编辑器 */}
          <div className="max-w-4xl mx-auto w-full">
            <label className="mb-2 block text-sm font-medium text-text-secondary">项目介绍</label>
            <Editor
              content={project.content}
              onChange={(content: string) => setProject((prev) => ({ ...prev, content }))}
              placeholder="开始介绍你的项目..."
            />
          </div>

          {/* 小屏幕大纲 */}
          <div className="md:hidden">
            <Outline content={project.content} />
          </div>

          {/* 设置按钮 */}
          <div className="flex justify-end">
            <button
              className="text-sm text-accent-primary hover:underline"
              onClick={() => setSettingsOpen(true)}
            >
              更多设置（SEO 等）→
            </button>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="hidden md:block shrink-0 w-[280px] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
          <Outline content={project.content} className="lg:flex lg:h-full lg:flex-col" />
        </div>
      </div>

      {/* SEO 和高级设置抽屉 */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={{
          status: project.status,
          categoryId: '',
          tagIds: project.tagIds,
          seoTitle: project.seoTitle,
          seoDescription: project.seoDescription,
          seoKeywords: '',
        }}
        onSettingsChange={(changes: SettingsChanges) => {
          const { categoryId: _, ...rest } = changes;
          setProject((prev) => ({ ...prev, ...rest }));
        }}
        categories={[]}
        tags={tags}
      />
    </div>
  );
}
