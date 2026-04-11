#!/usr/bin/env node
/**
 * @fileoverview 文章模板生成脚本
 * @description 快速创建包含正确 frontmatter 的 MDX 文章模板
 * @usage
 *   node scripts/create-article.mjs                    # 交互式创建
 *   node scripts/create-article.mjs "my-new-post"      # 使用 slug 创建
 *   node scripts/create-article.mjs "my-post" --draft   # 创建草稿
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');

/**
 * 生成 frontmatter 内容
 */
function generateFrontmatter(title, description, category, tags, draft) {
  const today = new Date().toISOString().split('T')[0];

  return `---
title: "${title}"
description: "${description}"
publishedAt: ${today}
category: ${category}
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
draft: ${draft}
featured: false
toc: true
readingTime: auto
cover:
  src: /images/blog/${slugify(title)}.png
  alt: "${title} 封面"
---

`;
}

/**
 * 生成文章模板内容
 */
function generateArticleContent(frontmatter) {
  return `${frontmatter}
## 引言

在这里写文章的引言...

## 主要内容

### 小节标题

正文内容...

> [!NOTE]
> 这是一个提示框示例

## 结论

总结文章的主要观点...

<!-- 在这里添加更多章节 -->
`;
}

/**
 * 将标题转换为 slug
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * 创建文章文件
 */
function createArticle(slug, title, description, category, tags, draft) {
  // 确保目录存在
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const filePath = path.join(contentDir, `${slug}.mdx`);

  // 检查文件是否已存在
  if (fs.existsSync(filePath)) {
    console.error(`❌ 文件已存在: ${filePath}`);
    process.exit(1);
  }

  const frontmatter = generateFrontmatter(title, description, category, tags, draft);
  const content = generateArticleContent(frontmatter);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 文章已创建: ${filePath}`);
  console.log(`📝 Slug: ${slug}`);
  console.log(`📂 类别: ${category}`);
  console.log(`🏷️  标签: ${tags.join(', ')}`);
  console.log(`📋 状态: ${draft ? '草稿' : '已发布'}`);
}

// 解析命令行参数
const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const positionalArgs = args.filter((a) => !a.startsWith('--'));

const isDraft = flags.includes('--draft');
const slug = positionalArgs[0] || slugify('untitled-' + Date.now());
const title = positionalArgs[1] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

createArticle(
  slug,
  title,
  '文章描述',
  '技术',
  ['Astro', 'React'],
  isDraft
);
