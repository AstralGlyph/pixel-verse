/**
 * @fileoverview 数据库迁移脚本
 * @description 使用 Drizzle ORM 创建所有数据表和索引
 * @usage node scripts/db-migrate.mjs
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/db/schema.ts';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/cms.db';
const absolutePath = path.resolve(dbPath);

// 确保数据目录存在
const dbDir = path.dirname(absolutePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`📦 正在连接数据库: ${absolutePath}`);

const sqlite = new Database(absolutePath);
sqlite.exec('PRAGMA foreign_keys = ON');
const db = drizzle(sqlite, { schema });

// 创建所有表
console.log('🔨 正在创建数据表...');

// 手动执行 SQL 创建表（Better SQLite3 + Drizzle 的迁移方式）
const createTablesSQL = `
-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  permissions TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_id TEXT NOT NULL REFERENCES roles(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id TEXT NOT NULL REFERENCES users(id),
  category_id TEXT REFERENCES categories(id),
  published_at TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (post_id, tag_id)
);

-- 媒体文件表
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  alt_text TEXT,
  uploader_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 页面表
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_id TEXT REFERENCES media(id),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  demo_url TEXT,
  source_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  published_at TEXT
);

-- 项目标签关联表
CREATE TABLE IF NOT EXISTS project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (project_id, tag_id)
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media(uploader_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_author ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_project_tags_project ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag_id);
`;

sqlite.exec(createTablesSQL);

console.log('✅ 数据表和索引创建完成');

// 验证表是否存在
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n📋 已创建的表:');
tables.forEach(t => console.log(`   - ${t.name}`));

// 验证索引
const indexes = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name").all();
console.log(`\n📋 已创建的索引 (${indexes.length} 个):`);
indexes.forEach(i => console.log(`   - ${i.name}`));

sqlite.close();
console.log('\n✨ 数据库迁移完成！');
