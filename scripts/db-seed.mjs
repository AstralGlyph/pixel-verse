/**
 * @fileoverview 数据库种子数据脚本
 * @description 插入默认角色和初始管理员用户
 * @usage node scripts/db-seed.mjs
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/cms.db';
const absolutePath = path.resolve(dbPath);

if (!fs.existsSync(absolutePath)) {
  console.error('❌ 数据库文件不存在，请先运行迁移脚本: node scripts/db-migrate.mjs');
  process.exit(1);
}

console.log(`🌱 正在连接数据库: ${absolutePath}`);

const sqlite = new Database(absolutePath);
sqlite.exec('PRAGMA foreign_keys = ON');
const db = drizzle(sqlite);

// 插入默认角色
console.log('\n👥 正在插入默认角色...');

const roles = [
  {
    id: randomUUID(),
    name: 'super_admin',
    displayName: '超级管理员',
    permissions: JSON.stringify(['*']),
  },
  {
    id: randomUUID(),
    name: 'editor',
    displayName: '编辑者',
    permissions: JSON.stringify(['posts.create', 'posts.edit', 'posts.publish', 'posts.delete', 'categories.manage', 'tags.manage', 'media.manage', 'pages.manage']),
  },
  {
    id: randomUUID(),
    name: 'author',
    displayName: '作者',
    permissions: JSON.stringify(['posts.create', 'posts.edit', 'posts.publish', 'media.manage']),
  },
];

// 检查角色是否已存在
const existingRoles = sqlite.prepare('SELECT name FROM roles').all();
if (existingRoles.length > 0) {
  console.log('⚠️  角色已存在，跳过插入');
} else {
  const insertRole = sqlite.prepare(
    'INSERT INTO roles (id, name, display_name, permissions) VALUES (?, ?, ?, ?)'
  );
  for (const role of roles) {
    insertRole.run(role.id, role.name, role.displayName, role.permissions);
    console.log(`   ✓ ${role.displayName} (${role.name})`);
  }
}

// 创建初始管理员用户
console.log('\n👤 正在创建初始管理员用户...');

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

const existingUser = sqlite.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);
if (existingUser) {
  console.log(`⚠️  用户 "${adminUsername}" 已存在，跳过创建`);
} else {
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const superAdminRole = sqlite.prepare('SELECT id FROM roles WHERE name = ?').get('super_admin');

  if (!superAdminRole) {
    console.error('❌ 超级管理员角色不存在');
    process.exit(1);
  }

  const adminId = randomUUID();
  const now = new Date().toISOString();

  sqlite.prepare(
    'INSERT INTO users (id, username, password_hash, email, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(adminId, adminUsername, passwordHash, adminEmail, superAdminRole.id, now, now);

  console.log(`   ✓ 管理员用户已创建:`);
  console.log(`     用户名: ${adminUsername}`);
  console.log(`     邮箱: ${adminEmail}`);
  console.log(`     密码: ${adminPassword} (请登录后立即修改)`);
}

// 插入示例分类
console.log('\n📂 正在插入示例分类...');

const categories = [
  { name: '技术', slug: 'tech', description: '技术相关文章' },
  { name: '生活', slug: 'life', description: '生活随笔' },
  { name: '设计', slug: 'design', description: '设计与创意' },
];

const existingCategories = sqlite.prepare('SELECT name FROM categories').all();
if (existingCategories.length > 0) {
  console.log('⚠️  分类已存在，跳过插入');
} else {
  const insertCategory = sqlite.prepare(
    'INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)'
  );
  for (const cat of categories) {
    insertCategory.run(randomUUID(), cat.name, cat.slug, cat.description);
    console.log(`   ✓ ${cat.name}`);
  }
}

// 插入示例标签
console.log('\n🏷️  正在插入示例标签...');

const tags = [
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'React', slug: 'react' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'CSS', slug: 'css' },
];

const existingTags = sqlite.prepare('SELECT name FROM tags').all();
if (existingTags.length > 0) {
  console.log('⚠️  标签已存在，跳过插入');
} else {
  const insertTag = sqlite.prepare(
    'INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)'
  );
  for (const tag of tags) {
    insertTag.run(randomUUID(), tag.name, tag.slug);
    console.log(`   ✓ ${tag.name}`);
  }
}

sqlite.close();
console.log('\n✨ 种子数据插入完成！');
