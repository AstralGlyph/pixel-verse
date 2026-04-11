/**
 * @fileoverview MDX 内容迁移脚本
 * @description 从 src/content/ 读取已有 MDX 文件，导入数据库为文章
 * @usage node scripts/migrate-mdx.mjs
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/db/schema.js';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/cms.db';
const contentDir = path.resolve('./src/content');

if (!fs.existsSync(contentDir)) {
  console.log('⚠️  未找到 src/content/ 目录，跳过 MDX 迁移');
  process.exit(0);
}

console.log(`📦 正在连接数据库: ${dbPath}`);
console.log(`📂 正在读取内容目录: ${contentDir}`);

const sqlite = new Database(dbPath);
sqlite.exec('PRAGMA foreign_keys = ON');
const db = drizzle(sqlite, { schema });

// 读取所有 MDX 文件
function findMdxFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

const mdxFiles = findMdxFiles(contentDir);
console.log(`\n📄 找到 ${mdxFiles.length} 个 MDX/MD 文件`);

if (mdxFiles.length === 0) {
  console.log('✅ 没有需要迁移的文件');
  sqlite.close();
  process.exit(0);
}

// 获取第一个管理员用户作为作者
const adminUser = sqlite.prepare("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'super_admin') LIMIT 1").get();
if (!adminUser) {
  console.error('❌ 未找到管理员用户，请先运行种子脚本');
  process.exit(1);
}

// 简单解析 frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2].trim();
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

// 生成 slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

let imported = 0;
let skipped = 0;

for (const filePath of mdxFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  const title = frontmatter.title || path.basename(filePath, path.extname(filePath));
  const slug = frontmatter.slug || generateSlug(title);
  const excerpt = frontmatter.description || frontmatter.excerpt || '';
  const seoTitle = frontmatter.seoTitle || frontmatter.title || title;
  const seoDescription = frontmatter.seoDescription || frontmatter.description || '';
  const seoKeywords = frontmatter.keywords || '';

  // 检查是否已存在
  const existing = sqlite.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
  if (existing) {
    console.log(`⏭️  跳过已存在: ${slug}`);
    skipped++;
    continue;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  sqlite.prepare(
    `INSERT INTO posts (id, title, slug, content, excerpt, status, author_id, seo_title, seo_description, seo_keywords, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)`
  ).run(id, title, slug, body, excerpt, adminUser.id, seoTitle, seoDescription, seoKeywords, now, now);

  console.log(`✅ 导入: ${title} -> /blog/${slug}`);
  imported++;
}

sqlite.close();
console.log(`\n✨ 迁移完成！导入 ${imported} 篇，跳过 ${skipped} 篇`);
