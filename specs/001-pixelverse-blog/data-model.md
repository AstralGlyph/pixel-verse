# Data Model: PixelVerse 个人博客系统

**Feature**: 001-pixelverse-blog  
**Date**: 2026-03-31  
**Purpose**: 定义系统核心数据实体、字段、关系和验证规则

---

## Core Entities

### 1. Article（文章）

博客核心内容单元，使用 MDX 格式存储。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | ✅ | 文章标题，用于 SEO title |
| description | string | ✅ | 文章摘要，用于 meta description |
| publishedAt | Date | ✅ | 发布日期（ISO 8601 格式） |
| updatedAt | Date | ❌ | 最后更新日期，展示"最后更新"标签 |
| tags | string[] | ✅ | 标签数组，用于分类和筛选 |
| category | string | ✅ | 分类名称（如：技术、生活、思考） |
| draft | boolean | ❌ | 草稿标记，默认 false。true 时构建排除 |
| featured | boolean | ❌ | 精选标记，默认 false。首页精选区展示 |
| cover | CoverImage | ❌ | 封面图对象 |
| toc | boolean | ❌ | 是否显示目录，默认 true |
| readingTime | number \| 'auto' | ❌ | 阅读时间（分钟），默认自动计算 |

#### Nested Type: CoverImage

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| src | string | ✅ | 图片路径（相对路径或 URL） |
| alt | string | ✅ | 图片替代文本，无障碍必填 |

#### Validation Rules

```typescript
import { z } from 'astro/zod';

const ArticleSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(50).max(200),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).min(1).max(10),
  category: z.string().min(1),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  cover: z.object({
    src: z.string(),
    alt: z.string().min(1)
  }).optional(),
  toc: z.boolean().default(true),
  readingTime: z.union([z.number(), z.literal('auto')]).default('auto')
});
```

#### Relationships

- Article → Tag: 多对多（一篇文章可有多个标签，一个标签可属于多篇文章）
- Article → Category: 多对一（一篇文章属于一个分类）

---

### 2. Project（项目）

作者的作品展示单元。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | ✅ | 项目名称 |
| description | string | ✅ | 项目简介 |
| tags | string[] | ✅ | 技术标签数组 |
| image | string | ❌ | 截图/动图预览路径 |
| demoUrl | string | ❌ | 在线预览链接 |
| sourceUrl | string | ❌ | 源码链接 |
| featured | boolean | ❌ | 精选标记，置顶显示 |
| order | number | ❌ | 排序权重，数字越大越靠前 |

#### Validation Rules

```typescript
const ProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(20).max(500),
  tags: z.array(z.string()).min(1).max(10),
  image: z.string().optional(),
  demoUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0)
});
```

---

### 3. Tag（标签）

文章分类标记，用于组织内容和筛选。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 标签名称（唯一） |
| slug | string | ✅ | URL 友好的标签 ID |
| description | string | ❌ | 标签描述 |
| color | string | ❌ | 标签颜色（十六进制） |

#### Derived Data

- `count`: 文章数量（运行时计算）
- `relatedTags`: 相关联的标签（基于文章共现计算）

---

### 4. Author Profile（作者档案）

个人品牌信息，存储在 `src/data/author.json`。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 姓名 |
| bio | string | ✅ | 简短自我介绍 |
| avatar | string | ✅ | 头像路径 |
| location | string | ❌ | 所在地 |
| website | string | ❌ | 个人网站 |
| email | string | ❌ | 联系邮箱 |
| social | SocialLinks | ❌ | 社交链接 |

#### Nested Type: SocialLinks

| 字段名 | 类型 | 说明 |
|--------|------|------|
| github | string | GitHub 用户名 |
| twitter | string | Twitter 用户名 |
| linkedin | string | LinkedIn 用户名 |
| youtube | string | YouTube 频道 |
| zhihu | string | 知乎用户名 |
| weibo | string | 微博用户名 |

---

### 5. Reaction（反应）

读者对文章的 emoji 反应记录。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| articleId | string | ✅ | 文章 ID |
| type | ReactionType | ✅ | 反应类型 |
| userHash | string | ✅ | IP 哈希（匿名标识） |
| timestamp | Date | ✅ | 反应时间 |

#### Enum: ReactionType

```typescript
type ReactionType = 'like' | 'love' | 'fire' | 'rocket' | 'eyes' | 'clap';
```

#### Business Rules

- 同一用户（userHash）对同一文章的反应次数上限：16 次
- 反应数据存储在 Edge KV 中
- KV 不可用时隐藏反应区域

---

### 6. View Count（阅读量）

文章访问统计。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| articleId | string | ✅ | 文章 ID |
| userHash | string | ✅ | IP 哈希（24 小时去重） |
| timestamp | Date | ✅ | 访问时间 |
| count | number | ✅ | 累计阅读数 |

#### Business Rules

- 同一 IP 哈希在 24 小时内对同一文章仅计数一次
- 使用 Edge KV 存储，设置 TTL = 24h
- 总计数单独存储（永久）

---

### 7. Newsletter Subscription（订阅）

邮件订阅记录。

#### Fields

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | ✅ | 订阅邮箱 |
| subscribedAt | Date | ✅ | 订阅时间 |
| confirmed | boolean | ✅ | 确认状态（双重确认） |
| confirmToken | string | ❌ | 确认令牌 |
| unsubscribedAt | Date | ❌ | 退订时间 |

#### Business Rules

- 邮箱格式验证
- Cloudflare Turnstile 无感验证
- 双重确认（Double Opt-in）流程
- 一键退订链接，符合 CAN-SPAM/GDPR

---

### 8. Theme Preference（主题偏好）

用户界面主题设置，存储在 Cookie 中。

#### Values

```typescript
type Theme = 'dark' | 'light' | 'system';
```

#### Storage

- Cookie 名称: `theme`
- 有效期: 1 年
- 仅功能性 Cookie，无需同意横幅

---

### 9. Cached Content（缓存内容）

Service Worker 缓存的文章和资源。

#### Cache Strategy

- **Cache First**: 静态资源（JS、CSS、字体）
- **Network First**: HTML 页面
- **Stale While Revalidate**: 图片

#### Cache Invalidation

- 版本化文件名（hash）
- Service Worker 更新触发缓存刷新

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│   Article   │───────│     Tag     │
│             │       │             │
│ - title     │       │ - name      │
│ - content   │       │ - slug      │
│ - tags[]    │       │ - color     │
│ - category  │       └─────────────┘
└─────────────┘              │
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  Reaction   │       │ ViewCount   │
│             │       │             │
│ - articleId │       │ - articleId │
│ - type      │       │ - count     │
│ - userHash  │       │ - userHash  │
└─────────────┘       └─────────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
           ┌─────────────┐
           │   Article   │
           │   (shared)  │
           └─────────────┘

┌─────────────┐       ┌─────────────┐
│   Project   │       │   Author    │
│             │       │             │
│ - title     │       │ - name      │
│ - tags[]    │       │ - bio       │
│ - demoUrl   │       │ - social    │
└─────────────┘       └─────────────┘
```

---

## Data Flow

### 文章阅读流程

```
用户访问 /blog/[slug]
        │
        ▼
  Astro 页面渲染
        │
        ├──▶ 读取 MDX 内容
        │         │
        │         ▼
        │    解析 Frontmatter
        │         │
        │         ▼
        │    渲染 MDX + React 组件
        │
        ├──▶ 计算阅读时间
        │
        ├──▶ 生成目录 (TOC)
        │
        └──▶ 客户端：
              │
              ├──▶ 记录阅读量 (KV)
              │
              └──▶ 加载评论 (Giscus)
```

### 主题切换流程

```
用户点击主题切换
        │
        ▼
  检查 View Transitions API 支持
        │
        ├──▶ 支持: startViewTransition()
        │              │
        │              ▼
        │         圆形展开动画
        │
        └──▶ 不支持: 直接切换
                │
                ▼
           更新 CSS 变量
                │
                ▼
           保存到 Cookie
```

---

## Data Migration

### 内容迁移

- Markdown → MDX: 需转换 frontmatter 格式和自定义组件语法
- 图片资源: 迁移至 `public/images/blog/` 并更新引用路径
- 元数据: 按新 Schema 重新组织

### 版本兼容

- Frontmatter Schema 版本化（在 `schema.ts` 中管理）
- 新增字段设置默认值，保证向后兼容