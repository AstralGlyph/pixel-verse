/**
 * @fileoverview 文章预览页面
 * @description 按前台渲染效果展示文章内容
 */

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Outline } from '../../components/common/Outline';
import { HighlightedMarkdownRenderer } from '../../../components/HighlightedMarkdownRenderer';

interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  author: { username: string };
  category: { name: string } | null;
  tags: Array<{ name: string }>;
}

interface PreviewPageProps {
  postId?: string;
}

export function PostPreviewPage({ postId }: PreviewPageProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError('文章 ID 不存在');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('获取文章失败');
        const result = await response.json();
        const postData = result.data || result;
        setPost(postData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="rounded-lg border border-error/30 bg-error/10 p-6 text-center text-error">
        {error || '文章不存在'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 page-content">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-glass-bg-hover"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          返回编辑
        </button>
        <div className="text-sm text-text-secondary">
          状态:{' '}
          <span className="font-medium text-text-primary">
            {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧大纲 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-[100px] lg:h-[calc(100vh-8rem)] lg:overflow-hidden">
            <Outline content={post.content} className="lg:flex lg:h-full lg:flex-col" />
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-3">
          <article className="glass-card rounded-xl p-8">
            <header className="mb-6 border-b border-glass-border pb-6">
              <h1 className="mb-3 text-3xl font-bold text-text-primary">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span>作者: {post.author?.username}</span>
                {post.category && <span>分类: {post.category.name}</span>}
                <span>创建: {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                {post.publishedAt && (
                  <span>发布: {new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full border border-glass-border bg-glass-bg-subtle px-2.5 py-0.5 text-xs text-text-secondary backdrop-blur"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 摘要 */}
            {post.excerpt && (
              <div className="mb-6 rounded-lg bg-glass-bg-subtle p-4 text-text-secondary italic">
                {post.excerpt}
              </div>
            )}

            {/* 内容渲染 — 启用 Shiki 语法高亮 */}
            <HighlightedMarkdownRenderer content={post.content} />
          </article>
        </div>
      </div>
    </div>
  );
}

export default PostPreviewPage;
