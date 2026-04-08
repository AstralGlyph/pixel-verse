/**
 * @fileoverview 文章设置抽屉组件
 * @description 从右侧滑入的设置面板，包含发布设置、分类标签、SEO 设置
 * @author AI
 * @dependencies lucide-react, src/admin/types/index.ts
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { PostStatus } from '../../types';

interface CategoryOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

const inputClass =
  'w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast';

interface PostSettings {
  status: PostStatus;
  categoryId: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PostSettings;
  onSettingsChange: (settings: Partial<PostSettings>) => void;
  categories: CategoryOption[];
  tags: TagOption[];
}

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  categories,
  tags,
}: SettingsDrawerProps) {
  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  return (
    <>
      {/* 遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-normal"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 抽屉面板 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="文章设置"
        className={`fixed right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-glass-bg/95 backdrop-blur-xl border-l border-glass-border z-50
          transform transition-transform duration-normal overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 抽屉头部 */}
        <div className="sticky top-0 bg-glass-bg/95 backdrop-blur-xl border-b border-glass-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-text-primary">文章设置</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
            className="p-1.5 rounded-md hover:bg-glass-bg-hover transition-colors text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 抽屉内容 */}
        <div className="p-4 space-y-5">
          {/* 发布设置 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">发布设置</h3>
            <div>
              <label className="mb-1 block text-xs text-text-secondary">状态</label>
              <select
                className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                value={settings.status}
                onChange={(e) =>
                  onSettingsChange({
                    status: e.target.value as 'draft' | 'published' | 'archived',
                  })
                }
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>

          {/* 分类和标签 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">分类和标签</h3>
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">分类</label>
                <select
                  className={inputClass}
                  value={settings.categoryId}
                  onChange={(e) => onSettingsChange({ categoryId: e.target.value })}
                >
                  <option value="">无分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-text-secondary">标签</label>
                <div className="mb-1.5 flex min-h-[28px] flex-wrap gap-1">
                  {settings.tagIds.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center gap-0.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-2 py-0.5 text-xs text-accent-primary backdrop-blur"
                      >
                        {tag.name}
                        <button
                          type="button"
                          aria-label={`移除标签 ${tag.name}`}
                          onClick={() =>
                            onSettingsChange({
                              tagIds: settings.tagIds.filter((id) => id !== tagId),
                            })
                          }
                          className="hover:text-accent-primary/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select
                  className={inputClass}
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !settings.tagIds.includes(e.target.value)) {
                      onSettingsChange({
                        tagIds: [...settings.tagIds, e.target.value],
                      });
                    }
                  }}
                >
                  <option value="">选择标签...</option>
                  {tags
                    .filter((t) => !settings.tagIds.includes(t.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEO 设置 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">SEO 设置</h3>
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 标题</label>
                <input
                  className={inputClass}
                  value={settings.seoTitle}
                  onChange={(e) => onSettingsChange({ seoTitle: e.target.value })}
                  placeholder="留空则使用文章标题"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 描述</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={settings.seoDescription}
                  onChange={(e) => onSettingsChange({ seoDescription: e.target.value })}
                  placeholder="搜索引擎展示的描述"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 关键词</label>
                <input
                  className={inputClass}
                  value={settings.seoKeywords}
                  onChange={(e) => onSettingsChange({ seoKeywords: e.target.value })}
                  placeholder="用逗号分隔"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
