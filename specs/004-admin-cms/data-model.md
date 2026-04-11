# Data Model: Admin CMS

**Date**: 2026-04-01  
**Feature**: 004-admin-cms

## Entities

### User

系统后台用户，用于登录和管理内容。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 用户唯一标识 |
| username | TEXT | UNIQUE, NOT NULL, 3-50 chars | 登录用户名 |
| password_hash | TEXT | NOT NULL | 加密后的密码 (bcrypt) |
| email | TEXT | UNIQUE, NOT NULL | 邮箱地址 |
| role_id | TEXT | NOT NULL, FK → Role.id | 关联角色 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**Validation Rules**:
- username: 3-50 字符，仅允许字母数字和下划线
- email: 有效邮箱格式
- password: 最少 8 字符，包含大小写字母和数字

---

### Role

权限角色定义，控制用户可执行的操作。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 角色唯一标识 |
| name | TEXT | UNIQUE, NOT NULL | 角色名称 (super_admin, editor, author) |
| display_name | TEXT | NOT NULL | 角色显示名称 |
| permissions | TEXT (JSON) | NOT NULL | 权限列表 (JSON 数组) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**Built-in Roles**:
- `super_admin`: 所有权限 (创建/编辑/删除文章、管理用户、管理分类标签、管理媒体、管理页面、系统设置)
- `editor`: 内容编辑 (创建/编辑/发布/删除所有文章、管理分类标签、管理媒体、管理页面)
- `author`: 内容作者 (创建/编辑/发布/删除自己的文章、上传媒体)

---

### Post

博客文章，CMS 的核心内容实体。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 文章唯一标识 |
| title | TEXT | NOT NULL, 1-200 chars | 文章标题 |
| slug | TEXT | UNIQUE, NOT NULL, URL-safe | URL 别名 |
| content | TEXT | NOT NULL | 文章正文 (Markdown 格式) |
| excerpt | TEXT | 可选, 最多 500 chars | 文章摘要 |
| cover_image | TEXT | 可选, FK → Media.id | 封面图片 |
| status | TEXT | NOT NULL, DEFAULT 'draft' | 状态: draft, published, archived |
| author_id | TEXT | NOT NULL, FK → User.id | 作者 |
| category_id | TEXT | 可选, FK → Category.id | 所属分类 |
| published_at | DATETIME | 可选 | 发布时间 |
| seo_title | TEXT | 可选, 最多 70 chars | SEO 标题 |
| seo_description | TEXT | 可选, 最多 160 chars | SEO 描述 |
| seo_keywords | TEXT | 可选 | SEO 关键词 (逗号分隔) |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | 浏览次数 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**State Transitions**:
```
draft ──publish──→ published ──archive──→ archived
  ↑                    │
  └─────unpublish──────┘
```

**Validation Rules**:
- title: 不能为空，1-200 字符
- slug: URL 安全字符 (小写字母、数字、连字符)，自动生成或自定义
- status: 仅允许 draft/published/archived
- published_at: 仅当 status=published 时必填

---

### Tag

文章的自由标签，与文章为多对多关系。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 标签唯一标识 |
| name | TEXT | UNIQUE, NOT NULL, 1-50 chars | 标签名称 |
| slug | TEXT | UNIQUE, NOT NULL, URL-safe | URL 别名 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### PostTag

文章与标签的多对多关联表。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| post_id | TEXT | NOT NULL, FK → Post.id, PK | 文章 ID |
| tag_id | TEXT | NOT NULL, FK → Tag.id, PK | 标签 ID |

---

### Category

文章的分类，与文章为一对多关系。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 分类唯一标识 |
| name | TEXT | UNIQUE, NOT NULL, 1-50 chars | 分类名称 |
| slug | TEXT | UNIQUE, NOT NULL, URL-safe | URL 别名 |
| description | TEXT | 可选, 最多 500 chars | 分类描述 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### Media

上传的媒体文件资源。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 文件唯一标识 |
| filename | TEXT | NOT NULL | 原始文件名 |
| stored_path | TEXT | NOT NULL | 存储路径 (相对于 public/uploads/) |
| mime_type | TEXT | NOT NULL | MIME 类型 (image/png, video/mp4, etc.) |
| file_size | INTEGER | NOT NULL | 文件大小 (字节) |
| alt_text | TEXT | 可选, 最多 200 chars | 替代文本 (无障碍) |
| uploader_id | TEXT | NOT NULL, FK → User.id | 上传者 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 上传时间 |

**Validation Rules**:
- file_size: 最大 10 MB
- mime_type: 仅允许 image/*, video/*, application/pdf, application/json

---

### Page

静态页面 (关于、联系等)。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 页面唯一标识 |
| title | TEXT | NOT NULL, 1-200 chars | 页面标题 |
| slug | TEXT | UNIQUE, NOT NULL, URL-safe | URL 别名 |
| content | TEXT | NOT NULL | 页面正文 (Markdown 格式) |
| status | TEXT | NOT NULL, DEFAULT 'draft' | 状态: draft, published |
| seo_title | TEXT | 可选, 最多 70 chars | SEO 标题 |
| seo_description | TEXT | 可选, 最多 160 chars | SEO 描述 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

### AuditLog

操作审计日志，记录关键操作。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 日志唯一标识 |
| user_id | TEXT | NOT NULL, FK → User.id | 操作人 |
| action | TEXT | NOT NULL | 操作类型 (post.create, post.publish, post.delete, user.create, etc.) |
| target_type | TEXT | NOT NULL | 目标类型 (post, page, user, category, tag, media) |
| target_id | TEXT | 可选 | 目标 ID |
| details | TEXT (JSON) | 可选 | 操作详情 (JSON 对象) |
| ip_address | TEXT | 可选 | 操作人 IP 地址 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 操作时间 |

---

### Session

用户会话，用于认证管理。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY, NOT NULL | 会话唯一标识 (存储在 HTTP-only Cookie) |
| user_id | TEXT | NOT NULL, FK → User.id | 关联用户 |
| expires_at | DATETIME | NOT NULL | 会话过期时间 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## Entity Relationships

```
User (1) ──── (N) Post          [author]
User (1) ──── (N) Media         [uploader]
User (1) ──── (N) AuditLog      [actor]
User (N) ──── (1) Role          [belongs to]
User (1) ──── (N) Session       [sessions]

Post (N) ──── (1) Category      [belongs to]
Post (N) ──── (N) Tag           [via PostTag junction table]
Post (N) ──── (0..1) Media      [cover image]

Page (standalone, no direct relationships)
```

## Indexes

```sql
-- Post indexes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- Tag indexes
CREATE INDEX idx_tags_slug ON tags(slug);

-- Category indexes
CREATE INDEX idx_categories_slug ON categories(slug);

-- Media indexes
CREATE INDEX idx_media_uploader ON media(uploader_id);

-- AuditLog indexes
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);

-- Session indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```
