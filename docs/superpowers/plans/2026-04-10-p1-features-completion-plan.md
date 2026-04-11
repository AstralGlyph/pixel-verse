# P1 功能补全 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补全 3 个 P1 功能缺口 — 用户自行修改密码、归档文章恢复、媒体 altText 编辑

**Architecture:** 每个功能独立实现：新增 service 函数 → 新增/修改 API 路由 → 修改前端 UI。遵循现有代码模式（service 层处理业务逻辑，API 路由负责认证和响应）。

**Tech Stack:** TypeScript, Drizzle ORM, Better SQLite3, React 18, Astro 5.x, bcryptjs, lucide-react

---

### Task 1: 密码修改后端 — changePassword service + API

**Files:**
- Modify: `src/lib/services/auth.service.ts`
- Create: `src/pages/api/admin/auth/change-password.ts`
- Modify: `src/lib/services/audit.service.ts`

- [ ] **Step 1: 在 audit.service.ts 中添加 PASSWORD_CHANGED 常量**

在 `AuditActions` 对象中添加新常量：

```typescript
// 在现有 AuditActions 对象中添加这一行
PASSWORD_CHANGED: 'user.password_changed',
```

- [ ] **Step 2: 在 auth.service.ts 中添加 changePassword 函数**

在文件末尾 `getUserById` 函数之后添加：

```typescript
/** 用户自行修改密码 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new ApiError('USER_NOT_FOUND', '用户不存在', 404);
  }

  // 验证当前密码
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError('INVALID_CURRENT_PASSWORD', '当前密码不正确', 401);
  }

  // 验证新密码长度
  if (newPassword.length < 6) {
    throw new ApiError('INVALID_PASSWORD', '新密码长度至少为 6 位', 400);
  }

  // 更新密码
  const passwordHash = await hashPassword(newPassword);
  const now = new Date().toISOString();
  await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, userId));
}
```

- [ ] **Step 3: 创建 change-password API 路由**

Create: `src/pages/api/admin/auth/change-password.ts`

```typescript
/**
 * @fileoverview 用户自行修改密码 API 路由
 * @description POST /api/admin/auth/change-password
 */

import type { APIRoute } from 'astro';
import { changePassword } from '../../../../lib/services/auth.service';
import { ok, error, getUserId, parseBody } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../lib/services/audit.service';

/** POST /api/admin/auth/change-password - 修改密码 */
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const userId = getUserId({ locals });
    const body = await parseBody<{ currentPassword: string; newPassword: string }>(request);

    if (!body.currentPassword || !body.newPassword) {
      return error(new ApiError('VALIDATION_ERROR', '当前密码和新密码均不能为空', 400));
    }

    await changePassword(userId, body.currentPassword, body.newPassword);

    // 记录审计日志
    await createAuditLog({
      userId,
      action: AuditActions.PASSWORD_CHANGED,
      targetType: TargetTypes.USER,
      targetId: userId,
    });

    return ok({ message: '密码已修改' });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('修改密码失败'));
  }
};
```

- [ ] **Step 4: 验证编译通过**

Run: `pnpm build` (或 `npx tsc --noEmit`)
Expected: 无类型错误

- [ ] **Step 5: 手动测试 — 密码修改 API**

Run: `pnpm dev`
用 curl 或浏览器测试：
```bash
# 先登录获取 cookie
curl -c cookies.txt -X POST http://localhost:4321/api/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

# 测试修改密码
curl -b cookies.txt -X POST http://localhost:4321/api/admin/auth/change-password \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"admin123","newPassword":"newpass123"}'

# 预期返回: {"success":true,"data":{"message":"密码已修改"}}
```

Expected: 返回 200 成功响应

- [ ] **Step 6: 提交**

```bash
git add src/lib/services/auth.service.ts src/lib/services/audit.service.ts src/pages/api/admin/auth/change-password.ts
git commit -m "feat(auth): 添加用户自行修改密码功能

- 新增 changePassword service 函数，验证当前密码后更新
- 新增 POST /api/admin/auth/change-password API 端点
- 添加 PASSWORD_CHANGED 审计日志类型"
```

---

### Task 2: 密码修改前端 — settings.tsx

**Files:**
- Modify: `src/admin/pages/settings.tsx`

- [ ] **Step 1: 修改 handleChangePassword 函数**

将现有的 `handleChangePassword` 函数（约 L52-69）替换为：

```typescript
const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (newPassword !== confirmPassword) {
    setError('两次输入的新密码不一致');
    return;
  }

  if (newPassword.length < 6) {
    setError('密码长度至少为 6 位');
    return;
  }

  if (!currentPassword) {
    setError('请输入当前密码');
    return;
  }

  try {
    const res = await fetch('/api/admin/auth/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess('密码已修改');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(data.error?.message || '修改密码失败');
    }
  } catch (err) {
    setError('修改密码失败，请重试');
  }
};
```

- [ ] **Step 2: 修改密码表单 UI — 移除提示信息，添加提交按钮**

在密码表单区域（`activeTab === 'password'` 的 form 内），将末尾的 `<p className="text-sm text-text-tertiary">` 提示替换为提交按钮。找到这段：

```tsx
<p className="text-sm text-text-tertiary">
  提示：当前版本需要管理员在用户管理页面重置密码。后续版本将支持用户自行修改密码。
</p>
```

替换为：

```tsx
<button
  type="submit"
  className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
  style={{ background: 'var(--gradient-primary)' }}
>
  <Key size={18} />
  修改密码
</button>
```

- [ ] **Step 3: 验证页面渲染正确**

Run: `pnpm dev`
Expected: 设置页面 → 修改密码 tab 显示"当前密码"、"新密码"、"确认新密码"三个输入框 + "修改密码"按钮

- [ ] **Step 4: 提交**

```bash
git add src/admin/pages/settings.tsx
git commit -m "feat(settings): 实现用户自行修改密码前端

- 替换占位提示为真实 API 调用
- 增加当前密码验证和提交按钮"
```

---

### Task 3: 归档文章恢复后端 — unarchivePost service + API

**Files:**
- Modify: `src/lib/services/post.service.ts`
- Modify: `src/lib/services/audit.service.ts`
- Create: `src/pages/api/admin/posts/[id]/unarchive.ts`

- [ ] **Step 1: 修改 unpublishPost 行为 — published → archived（而非 draft）**

在 `post.service.ts` 中找到 `unpublishPost` 函数，将：

```typescript
await db.update(posts).set({ status: 'draft', updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
```

修改为：

```typescript
await db.update(posts).set({ status: 'archived', updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
```

- [ ] **Step 2: 在 audit.service.ts 中添加 POST_UNARCHIVED 常量**

在 `AuditActions` 对象中添加：

```typescript
POST_UNARCHIVED: 'post.unarchived',
```

- [ ] **Step 3: 在 post.service.ts 中添加 unarchivePost 函数**

在 `archivePost` 函数之后添加：

```typescript
/** 恢复归档文章（archived → draft） */
export async function unarchivePost(id: string) {
  const post = await getPostById(id);
  if (!post) {
    throw new ApiError('POST_NOT_FOUND', '文章不存在', 404);
  }

  if (post.status !== 'archived') {
    throw new ApiError('INVALID_TRANSITION', '只有归档的文章才能恢复', 400);
  }

  await db.update(posts).set({ status: 'draft', updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
  return getPostById(id);
}
```

- [ ] **Step 4: 创建 unarchive API 路由**

Create: `src/pages/api/admin/posts/[id]/unarchive.ts`

```typescript
/**
 * @fileoverview 恢复归档文章 API 路由
 * @description POST /api/admin/posts/:id/unarchive
 */

import type { APIRoute } from 'astro';
import { unarchivePost } from '../../../../../lib/services/post.service';
import { ok, error, getUserId } from '../../../../../api/index';
import { ApiError } from '../../../../../lib/utils/errors';
import { createAuditLog, AuditActions, TargetTypes } from '../../../../../lib/services/audit.service';

/** POST /api/admin/posts/:id/unarchive - 恢复归档文章 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    const userId = getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '文章 ID 不能为空', 400));

    const post = await unarchivePost(id);

    await createAuditLog({
      userId,
      action: AuditActions.POST_UNARCHIVED,
      targetType: TargetTypes.POST,
      targetId: id,
    });

    return ok(post);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('恢复文章失败'));
  }
};
```

- [ ] **Step 5: 验证编译通过**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 6: 提交**

```bash
git add src/lib/services/post.service.ts src/lib/services/audit.service.ts src/pages/api/admin/posts/\[id\]/unarchive.ts
git commit -m "feat(posts): 添加归档文章恢复功能

- 修改 unpublishPost: published → archived（而非 draft）
- 新增 unarchivePost service: archived → draft
- 新增 POST /api/admin/posts/:id/unarchive API 端点"
```

---

### Task 4: 归档文章恢复前端 — posts/index.tsx 操作按钮

**Files:**
- Modify: `src/admin/pages/posts/index.tsx`

- [ ] **Step 1: 添加新的 lucide 图标导入**

修改 import 语句，添加 `Send` 和 `RotateCcw`：

```typescript
import { Plus, Edit2, Trash2, Eye, Filter, Send, RotateCcw, Archive } from 'lucide-react';
```

- [ ] **Step 2: 添加 handlePublish、handleUnpublish 和 handleUnarchive 函数**

在 `handleDelete` 函数之后添加：

```typescript
const handlePublish = async (id: string) => {
  if (!confirm('确定要发布这篇文章吗？')) return;

  try {
    const response = await fetch(`/api/admin/posts/${id}/publish`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('发布失败');
    fetchPosts(pagination.page, statusFilter || undefined);
  } catch (err) {
    alert(err instanceof Error ? err.message : '发布失败');
  }
};

const handleUnpublish = async (id: string) => {
  if (!confirm('确定要取消发布吗？文章将被归档。')) return;

  try {
    const response = await fetch(`/api/admin/posts/${id}/unpublish`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('取消发布失败');
    fetchPosts(pagination.page, statusFilter || undefined);
  } catch (err) {
    alert(err instanceof Error ? err.message : '取消发布失败');
  }
};

const handleUnarchive = async (id: string) => {
  if (!confirm('确定要恢复这篇文章吗？文章将恢复为草稿状态。')) return;

  try {
    const response = await fetch(`/api/admin/posts/${id}/unarchive`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('恢复失败');
    fetchPosts(pagination.page, statusFilter || undefined);
  } catch (err) {
    alert(err instanceof Error ? err.message : '恢复失败');
  }
};
```

- [ ] **Step 3: 修改操作列 — 根据状态显示不同按钮**

找到表格操作列的 `<td className="px-4 py-3 text-right">` 部分（当前只有预览/编辑/删除三个按钮），替换为：

```tsx
<td className="px-4 py-3 text-right">
  <div className="flex items-center justify-end gap-2">
    {post.status === 'published' && (
      <button
        className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
        title="预览"
        onClick={() => window.open(`/blog/${encodeURIComponent(post.slug)}`, '_blank')}
      >
        <Eye className="h-4 w-4" />
      </button>
    )}
    {post.status === 'draft' && (
      <button
        className="rounded p-1 text-text-secondary transition-colors hover:text-success"
        title="发布"
        onClick={() => handlePublish(post.id)}
      >
        <Send className="h-4 w-4" />
      </button>
    )}
    {post.status === 'published' && (
      <button
        className="rounded p-1 text-text-secondary transition-colors hover:text-warning"
        title="取消发布"
        onClick={() => handleUnpublish(post.id)}
      >
        <Archive className="h-4 w-4" />
      </button>
    )}
    {post.status === 'archived' && (
      <button
        className="rounded p-1 text-text-secondary transition-colors hover:text-success"
        title="恢复"
        onClick={() => handleUnarchive(post.id)}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    )}
    <button
      className="rounded p-1 text-text-secondary transition-colors hover:text-accent-primary"
      title="编辑"
      onClick={() => window.location.href = `/admin/posts/${post.id}/edit`}
    >
      <Edit2 className="h-4 w-4" />
    </button>
    <button
      className="rounded p-1 text-error/80 transition-colors hover:text-error"
      title="删除"
      onClick={() => handleDelete(post.id)}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
</td>
```

- [ ] **Step 4: 验证筛选和按钮渲染**

Run: `pnpm dev`
Expected:
- "已归档"筛选按钮可点击，显示归档文章
- 草稿文章显示"发布"+"编辑"+"删除"按钮
- 已发布文章显示"预览"+"取消发布"+"编辑"+"删除"按钮
- 已归档文章显示"恢复"+"编辑"+"删除"按钮

- [ ] **Step 5: 提交**

```bash
git add src/admin/pages/posts/index.tsx
git commit -m "feat(posts): 添加归档恢复/发布/取消发布操作按钮

- 草稿: 发布按钮 (→ published)
- 已发布: 取消发布按钮 (→ archived) + 预览按钮
- 已归档: 恢复按钮 (→ draft)
- 已归档筛选按钮已存在"
```

---

### Task 5: 媒体 altText 编辑后端 — updateMedia service + API

**Files:**
- Modify: `src/lib/services/media.service.ts`
- Modify: `src/pages/api/admin/media/[id]/index.ts`
- Modify: `src/lib/services/audit.service.ts`

- [ ] **Step 1: 在 audit.service.ts 中添加 MEDIA_UPDATED 常量**

在 `AuditActions` 对象中添加：

```typescript
MEDIA_UPDATED: 'media.updated',
```

- [ ] **Step 2: 在 media.service.ts 中添加 updateMedia 函数**

在文件末尾 `deleteMedia` 函数之后添加：

```typescript
/** 更新媒体元信息 */
export async function updateMedia(id: string, data: { altText?: string }) {
  const item = await getMediaById(id);
  if (!item) {
    throw new ApiError('MEDIA_NOT_FOUND', '媒体文件不存在', 404);
  }

  const updates: Record<string, unknown> = {};
  if (data.altText !== undefined) updates.altText = data.altText;

  if (Object.keys(updates).length > 0) {
    // 动态更新（Drizzle SQLite 不支持部分更新）
    await db.update(media).set(updates).where(eq(media.id, id));
  }

  return getMediaById(id);
}
```

- [ ] **Step 3: 在 media/[id]/index.ts 中添加 PUT handler**

在现有的 DELETE handler 之前添加：

```typescript
/** PUT /api/admin/media/[id] - 更新媒体元信息 */
export const PUT: APIRoute = async ({ locals, params, request }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '媒体 ID 不能为空', 400));

    const body = await request.json();
    const updated = await updateMedia(id, { altText: body.altText });
    return ok(updated);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('更新媒体失败'));
  }
};
```

并在文件顶部添加 import：

```typescript
import { updateMedia } from '../../../../../lib/services/media.service';
import { ok, error, getUserId } from '../../../../../api/index';
```

- [ ] **Step 4: 验证编译通过**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add src/lib/services/media.service.ts src/lib/services/audit.service.ts src/pages/api/admin/media/\[id\]/index.ts
git commit -m "feat(media): 添加媒体 altText 更新 API

- 新增 updateMedia service 函数
- 在 media/[id] 路由中添加 PUT handler
- 添加 MEDIA_UPDATED 审计日志类型"
```

---

### Task 6: 媒体 altText 编辑前端 — media.tsx

**Files:**
- Modify: `src/admin/pages/media.tsx`

- [ ] **Step 1: 添加状态和保存函数**

在 `fileInputRef` 之后添加状态：

```typescript
const [savingAltTextId, setSavingAltTextId] = useState<string | null>(null);
```

在 `handleDelete` 函数之后添加：

```typescript
const handleAltTextChange = async (id: string, newAltText: string) => {
  setSavingAltTextId(id);
  try {
    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText: newAltText || null }),
    });
    if (!response.ok) throw new Error('保存失败');

    // 乐观更新本地状态
    setMediaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, altText: newAltText || null } : item))
    );
  } catch (err) {
    alert(err instanceof Error ? err.message : '保存 alt 文本失败');
  } finally {
    setSavingAltTextId(null);
  }
};
```

- [ ] **Step 2: 网格视图中添加 altText 编辑框**

在网格视图（`viewMode === 'grid'`）的媒体卡片中，找到文件名下方的区域：

```tsx
<div className="mt-2 truncate">
  <p className="text-xs font-medium text-text-primary" title={item.filename}>
    {item.filename}
  </p>
  <p className="text-xs text-text-tertiary">{formatFileSize(item.fileSize)}</p>
</div>
```

替换为：

```tsx
<div className="mt-2 truncate">
  <p className="text-xs font-medium text-text-primary" title={item.filename}>
    {item.filename}
  </p>
  <p className="text-xs text-text-tertiary">{formatFileSize(item.fileSize)}</p>
  <input
    className="mt-1 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-text-primary placeholder-text-tertiary focus:border-glass-border focus:bg-glass-bg-subtle focus:outline-none transition-all duration-fast"
    placeholder="添加描述..."
    defaultValue={item.altText || ''}
    onBlur={(e) => handleAltTextChange(item.id, e.target.value)}
    disabled={savingAltTextId === item.id}
    onClick={(e) => e.stopPropagation()}
  />
</div>
```

- [ ] **Step 3: 列表视图中添加 altText 列**

在列表视图（`viewMode === 'list'`）的表头 `<thead>` 中，在"文件"列之后添加：

```tsx
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">描述</th>
```

在 `<tbody>` 的每行中，文件名单元格之后添加：

```tsx
<td className="px-4 py-3">
  <input
    className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-text-primary placeholder-text-tertiary focus:border-glass-border focus:bg-glass-bg-subtle focus:outline-none transition-all duration-fast"
    placeholder="添加描述..."
    defaultValue={item.altText || ''}
    onBlur={(e) => handleAltTextChange(item.id, e.target.value)}
    disabled={savingAltTextId === item.id}
    onClick={(e) => e.stopPropagation()}
  />
</td>
```

- [ ] **Step 4: 验证 altText 编辑功能**

Run: `pnpm dev`
Expected:
- 网格视图：每个媒体卡片文件名下方有"添加描述..."输入框
- 列表视图："描述"列有输入框
- 失焦时自动保存，保存成功后更新列表
- 输入框点击不触发行选中（e.stopPropagation）

- [ ] **Step 5: 提交**

```bash
git add src/admin/pages/media.tsx
git commit -m "feat(media): 添加媒体 altText 编辑功能

- 网格/列表视图中增加 altText 输入框
- 失焦时自动调用 PUT API 保存
- 保存时显示 loading 状态"
```

---

### Task 7: 端到端验证

**Files:** 无修改，仅验证

- [ ] **Step 1: 完整功能测试**

Run: `pnpm dev`

验证清单：

1. **密码修改**:
   - 进入设置 → 修改密码 tab
   - 输入错误当前密码 → 提示"当前密码不正确"
   - 输入正确密码 → 提示"密码已修改"
   - 用新密码重新登录验证成功

2. **归档恢复**:
   - 发布一篇新文章
   - 在列表中点击"取消发布" → 文章变为"已归档"
   - 切换到"已归档"筛选 → 文章出现在列表中
   - 点击"恢复" → 文章变为"草稿"状态

3. **媒体 altText**:
   - 上传一张图片
   - 在网格视图中输入 altText → 失焦后刷新页面验证持久化
   - 在列表视图中输入 altText → 同样验证

- [ ] **Step 2: 最终提交**

```bash
git log --oneline -7
# 确认 6 个功能提交都已创建

git push origin 004-admin-cms
```
