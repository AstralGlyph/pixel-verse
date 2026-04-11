# 编辑文章页面布局重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构编辑文章页面，采用抽屉设置 + 大纲压缩布局，使编辑器获得 896px 最大宽度居中，设置项通过右侧抽屉面板访问。

**Architecture:** 将当前内嵌在 edit.tsx 中的设置表单（发布设置、分类标签、SEO）抽取为独立的 SettingsDrawer 组件。edit.tsx 负责布局：左侧主内容区 + 右侧面板（大纲 + 可选抽屉）。使用 React state `showSettings` 控制抽屉开关，CSS transition 实现平滑宽度切换。

**Tech Stack:** React 18, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: 创建 SettingsDrawer 组件

**Files:**
- Create: `src/admin/components/editor/SettingsDrawer.tsx`
- Reference: `src/admin/pages/posts/edit.tsx:361-493` (当前内嵌的设置表单代码)

- [ ] **Step 1: 创建 SettingsDrawer 组件文件**

`src/admin/components/editor/SettingsDrawer.tsx`

```typescript
/**
 * @fileoverview 文章设置抽屉组件
 * @description 从右侧滑入的设置面板，包含发布设置、分类标签、SEO 设置
 */

import { X } from 'lucide-react';

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

interface PostSettings {
  status: 'draft' | 'published' | 'archived';
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
  categories: Category[];
  tags: Tag[];
}

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  categories,
  tags,
}: SettingsDrawerProps) {
  return (
    <>
      {/* 遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-normal"
          onClick={onClose}
        />
      )}

      {/* 抽屉面板 */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[320px] bg-glass-bg/95 backdrop-blur-xl border-l border-glass-border z-50 
          transform transition-transform duration-normal overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 抽屉头部 */}
        <div className="sticky top-0 bg-glass-bg/95 backdrop-blur-xl border-b border-glass-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-text-primary">文章设置</h2>
          <button
            type="button"
            onClick={onClose}
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
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
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
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
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
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                  value={settings.seoTitle}
                  onChange={(e) => onSettingsChange({ seoTitle: e.target.value })}
                  placeholder="留空则使用文章标题"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 描述</label>
                <textarea
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                  rows={3}
                  value={settings.seoDescription}
                  onChange={(e) => onSettingsChange({ seoDescription: e.target.value })}
                  placeholder="搜索引擎展示的描述"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">SEO 关键词</label>
                <input
                  className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit --pretty 2>&1 | grep SettingsDrawer`
Expected: No errors related to SettingsDrawer

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/editor/SettingsDrawer.tsx
git commit -m "feat: add SettingsDrawer component for post edit settings"
```

---

### Task 2: 重构 PostEditPage 布局

**Files:**
- Modify: `src/admin/pages/posts/edit.tsx` (complete rewrite of JSX layout)
- Reference: `src/admin/components/common/Outline.tsx` (大纲组件，不需要修改)

- [ ] **Step 1: 更新 import 和添加 state**

修改 `src/admin/pages/posts/edit.tsx`，更新 import 行：

```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Editor } from '../../components/editor/Editor';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Outline } from '../../components/common/Outline';
import { SettingsDrawer } from '../../components/editor/SettingsDrawer';
import { Save, Send, Eye, ArrowLeft, X, Settings } from 'lucide-react';
```

在 `const _newTagName = useState('')[0];` 之后添加：

```typescript
const [showSettings, setShowSettings] = useState(false);
```

- [ ] **Step 2: 添加 ESC 键关闭抽屉**

在现有的 `useEffect` 区块之后（加载文章之后）添加：

```typescript
  // ESC 键关闭抽屉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
      // Ctrl/Cmd + , 打开设置
      if ((e.ctrlKey || e.metaKey) && e.key === ',' && !showSettings) {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings]);
```

- [ ] **Step 3: 替换 JSX 返回部分 — Header 区域**

将 JSX 的 Header 部分（原来的 `<div className="flex items-center justify-between">` 块）替换为：

```tsx
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
```

- [ ] **Step 4: 替换 JSX 返回部分 — 主内容区**

替换从 `{/* 编辑器 + 右侧面板 */}` 到 `</div>` 结尾的整个区块（约第 351-573 行）：

```tsx
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
```

- [ ] **Step 5: 移除未使用的 import**

由于 `_newTagName` 不再被使用（原来就没有真正使用），可以保留或移除。由于它是无用的代码但不在本次重构范围，保留不变。

注意：`X` import 在 SettingsDrawer 中使用，所以 edit.tsx 不再需要 `X`。更新 import 行：

```typescript
import { Save, Send, Eye, ArrowLeft, Settings } from 'lucide-react';
```

（移除了 `X`，因为标签删除逻辑已移到 SettingsDrawer 中）

- [ ] **Step 6: 验证构建**

Run: `npx astro build 2>&1 | tail -20`
Expected: Build completes without errors

- [ ] **Step 7: Commit**

```bash
git add src/admin/pages/posts/edit.tsx
git commit -m "refactor: restructure post edit page with drawer settings and centered editor"
```

---

### Task 3: 完善响应式和小屏幕适配

**Files:**
- Modify: `src/admin/pages/posts/edit.tsx`
- Modify: `src/admin/components/editor/SettingsDrawer.tsx`

- [ ] **Step 1: 右侧面板响应式处理**

修改 `src/admin/pages/posts/edit.tsx` 中右侧面板的 `className`，在 `< md` 屏幕下大纲折叠为可展开区域：

```tsx
        {/* 右侧面板：大纲 + 设置抽屉 */}
        <div
          className={`hidden md:block shrink-0 transition-all duration-normal ${
            showSettings ? 'w-[200px]' : 'w-[280px]'
          } lg:sticky lg:top-20`}
        >
          <Outline content={post.content} />
        </div>
```

在左侧编辑器区域内、编辑器下方，为小屏幕添加可展开的大纲区域：

```tsx
          {/* 富文本编辑器 */}
          <div className="max-w-4xl mx-auto w-full">
            <label className="mb-2 block text-sm font-medium text-text-secondary">正文内容</label>
            <Editor
              content={post.content}
              onChange={(content) => setPost((prev) => ({ ...prev, content }))}
              placeholder="开始写作..."
            />
          </div>

          {/* 小屏幕大纲 */}
          <div className="md:hidden">
            <Outline content={post.content} />
          </div>
```

- [ ] **Step 2: 抽屉面板响应式**

`SettingsDrawer` 在小屏幕下应占满宽度。修改 `src/admin/components/editor/SettingsDrawer.tsx` 中抽屉面板的 `className`：

```tsx
      {/* 抽屉面板 */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-glass-bg/95 backdrop-blur-xl border-l border-glass-border z-50 
          transform transition-transform duration-normal overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
```

关键变更：添加 `max-w-[85vw]` 确保在小屏幕上抽屉不会溢出。

- [ ] **Step 3: 验证构建**

Run: `npx astro build 2>&1 | tail -10`
Expected: Build completes without errors

- [ ] **Step 4: Commit**

```bash
git add src/admin/pages/posts/edit.tsx src/admin/components/editor/SettingsDrawer.tsx
git commit -m "feat: add responsive layout for post edit page"
```

---

### Task 4: 最终验证和清理

**Files:**
- Verify: `src/admin/pages/posts/edit.tsx`
- Verify: `src/admin/components/editor/SettingsDrawer.tsx`

- [ ] **Step 1: 运行 dev 服务器手动验证**

Run: `pnpm dev`
Expected: Dev server starts without errors

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: 清理未使用的 import**

Run: `grep -n "useState" src/admin/pages/posts/edit.tsx`
Verify: `_newTagName` 行可以安全移除

如果确认 `_newTagName` 完全未使用（搜索确认无引用），移除该行：

```typescript
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const titleInputRef = useRef<HTMLInputElement>(null);
```

（移除 `const _newTagName = useState('')[0];` 行）

- [ ] **Step 4: 最终 Commit**

```bash
git add src/admin/pages/posts/edit.tsx src/admin/components/editor/SettingsDrawer.tsx
git commit -m "chore: clean up unused imports in post edit page"
```
