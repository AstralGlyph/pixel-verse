# Design: P1 功能补全 — 密码修改、归档恢复、媒体 altText 编辑

**Created**: 2026-04-10
**Status**: Draft
**Branch**: `004-admin-cms`

---

## 概述

补全 3 个第一批（P1）功能缺口：

1. **用户自行修改密码** — settings 页面增加当前密码验证，调用新 API 修改密码
2. **归档文章恢复** — 列表筛选器增加"已归档"选项，新增 unarchive API
3. **媒体 altText 编辑** — 媒体卡片增加 altText 编辑输入框，新增 media update API

---

## 功能 1：用户自行修改密码

### 1.1 后端 API

**新增端点**: `POST /api/admin/auth/change-password`

**新增服务函数**: `src/lib/services/auth.service.ts` → `changePassword(userId, currentPassword, newPassword)`

**逻辑**:
1. 从 session 获取当前用户 ID
2. 查询用户的 `passwordHash`
3. `bcrypt.compare` 验证 `currentPassword`
4. 验证失败 → 401 `INVALID_CURRENT_PASSWORD` "当前密码不正确"
5. 验证通过 → `bcrypt.hash` 新密码，更新 `users.passwordHash`
6. 记录审计日志（`action: "user.change_password"`）
7. 返回 `{ success: true }`

**请求体**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### 1.2 前端（settings.tsx）

**改动**:
- `handleChangePassword` 不再直接返回错误提示，改为调用 API
- 密码表单增加"当前密码"输入框（在"新密码"上方）
- 调用 `POST /api/admin/auth/change-password`
- 成功后提示"密码已修改"，清空三个输入框
- 失败时显示后端返回的错误信息

**表单结构**:
```
当前密码 ━━━━━━━━━━━━ [输入框]
新密码 ━━━━━━━━━━━━━━ [输入框]
确认密码 ━━━━━━━━━━━━ [输入框]
[修改密码按钮]
```

---

## 功能 2：归档文章恢复

### 2.1 后端 API

**新增端点**: `POST /api/admin/posts/:id/unarchive`

**新增服务函数**: `src/lib/services/post.service.ts` → `unarchivePost(id)`

**逻辑**:
1. 验证用户权限
2. 查询文章，确认状态为 `archived`
3. 更新 `status = 'draft'`、`updatedAt = now`
4. 记录审计日志
5. 返回文章对象

### 2.2 前端（posts/index.tsx）

**改动**:
- 状态筛选器增加"已归档"选项（在"全部"、"草稿"、"已发布"之后）
- `getStatusBadge` 增加 `archived` 状态的 badge 样式
- 操作列增加逻辑：
  - `archived` 状态显示"恢复"按钮 → 调用 `POST /api/admin/posts/:id/unarchive`
  - `published` 状态保持"取消发布"按钮（变为 archived）
  - `draft` 状态保持"发布"/"删除"按钮
- 恢复后刷新列表

---

## 功能 3：媒体 altText 编辑

### 3.1 后端 API

**新增端点**: `PUT /api/admin/media/:id`

**复用现有文件**: `src/pages/api/admin/media/[id]/index.ts`（当前只有 DELETE，新增 PUT handler）

**新增服务函数**: `src/lib/services/media.service.ts` → `updateMedia(id, data)`

**逻辑**:
1. 验证用户权限
2. 查询媒体记录是否存在
3. 更新允许的字段：`altText`
4. 返回更新后的媒体对象

**请求体**:
```json
{
  "altText": "string"
}
```

### 3.2 前端（media.tsx）

**改动**:
- 媒体网格/列表视图中，在文件名下方增加 altText 输入框
- 使用 `onBlur` 触发保存（失焦时调用 API）
- 保存中显示 loading 指示器
- 保存失败回滚到原值并提示错误

---

## 受影响文件清单

| 文件 | 改动类型 | 功能 |
|------|----------|------|
| `src/lib/services/auth.service.ts` | 新增函数 | changePassword |
| `src/pages/api/admin/auth/change-password.ts` | 新增文件 | API 路由 |
| `src/admin/pages/settings.tsx` | 修改 | 增加当前密码输入框，实现真实 API 调用 |
| `src/lib/services/post.service.ts` | 新增函数 | unarchivePost |
| `src/pages/api/admin/posts/[id]/unarchive.ts` | 新增文件 | API 路由 |
| `src/admin/pages/posts/index.tsx` | 修改 | 增加归档筛选、恢复按钮 |
| `src/lib/services/media.service.ts` | 新增函数 | updateMedia |
| `src/pages/api/admin/media/[id]/index.ts` | 修改 | 新增 PUT handler |
| `src/admin/pages/media.tsx` | 修改 | 增加 altText 编辑 |

---

## 测试策略

### 单元测试
- `changePassword`: 正确密码修改成功、错误密码拒绝、新密码太短拒绝
- `unarchivePost`: 归档文章恢复为草稿、非归档文章调用失败
- `updateMedia`: altText 更新成功、不存在的媒体返回 404

### 集成测试
- 登录后修改密码 → 用新密码重新登录验证
- 发布 → 取消发布 → 恢复 完整状态流转
- 媒体上传后编辑 altText → 查询验证
