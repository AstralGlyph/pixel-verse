# API Contract: Posts

**Version**: v1  
**Base Path**: `/api/admin/posts`

## List Posts

**GET** `/api/admin/posts`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: draft, published, archived |
| category_id | string | No | Filter by category |
| tag_id | string | No | Filter by tag |
| author_id | string | No | Filter by author |
| date_from | string | No | Filter from date (ISO 8601) |
| date_to | string | No | Filter to date (ISO 8601) |
| page | number | No | Page number (default: 1) |
| per_page | number | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field: title, created_at, published_at (default: created_at) |
| order | string | No | Sort order: asc, desc (default: desc) |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "文章标题",
      "slug": "article-slug",
      "excerpt": "文章摘要...",
      "status": "published",
      "author": { "id": "uuid", "username": "author_name" },
      "category": { "id": "uuid", "name": "分类名" },
      "tags": [{ "id": "uuid", "name": "标签名" }],
      "published_at": "2026-04-01T10:00:00Z",
      "created_at": "2026-04-01T09:00:00Z",
      "updated_at": "2026-04-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

## Get Post

**GET** `/api/admin/posts/:id`

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "title": "文章标题",
    "slug": "article-slug",
    "content": "Markdown 内容...",
    "excerpt": "文章摘要",
    "cover_image_id": "uuid",
    "status": "published",
    "author_id": "uuid",
    "category_id": "uuid",
    "tag_ids": ["uuid1", "uuid2"],
    "seo_title": "SEO 标题",
    "seo_description": "SEO 描述",
    "seo_keywords": "关键词1,关键词2",
    "view_count": 150,
    "published_at": "2026-04-01T10:00:00Z",
    "created_at": "2026-04-01T09:00:00Z",
    "updated_at": "2026-04-01T10:00:00Z"
  }
}
```

### Response 404
```json
{ "error": { "code": "POST_NOT_FOUND", "message": "文章不存在" } }
```

---

## Create Post

**POST** `/api/admin/posts`

### Request Body
```json
{
  "title": "新文章标题",
  "slug": "new-article-slug",
  "content": "Markdown 内容...",
  "excerpt": "文章摘要",
  "cover_image_id": "uuid",
  "status": "draft",
  "category_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "seo_title": "SEO 标题",
  "seo_description": "SEO 描述",
  "seo_keywords": "关键词1,关键词2"
}
```

### Required Fields
- `title`: 1-200 字符

### Response 201
```json
{
  "data": {
    "id": "uuid",
    "title": "新文章标题",
    "slug": "new-article-slug",
    "status": "draft",
    "created_at": "2026-04-01T10:00:00Z"
  }
}
```

### Response 400
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "标题不能为空", "fields": ["title"] } }
```

### Response 409
```json
{ "error": { "code": "SLUG_EXISTS", "message": "URL 别名已存在" } }
```

---

## Update Post

**PUT** `/api/admin/posts/:id`

### Request Body
Same as Create Post (all fields optional)

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "title": "更新后的标题",
    "updated_at": "2026-04-01T11:00:00Z"
  }
}
```

---

## Publish Post

**POST** `/api/admin/posts/:id/publish`

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2026-04-01T12:00:00Z"
  }
}
```

### Response 400
```json
{ "error": { "code": "INVALID_TRANSITION", "message": "已归档的文章不能发布" } }
```

---

## Delete Post

**DELETE** `/api/admin/posts/:id`

### Response 204 (No Content)

### Response 404
```json
{ "error": { "code": "POST_NOT_FOUND", "message": "文章不存在" } }
```
