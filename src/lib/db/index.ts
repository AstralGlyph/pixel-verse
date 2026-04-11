/**
 * @fileoverview 数据库连接模块
 * @description 初始化 Better SQLite3 连接并提供 Drizzle ORM 实例
 * @dependencies drizzle-orm, better-sqlite3
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/cms.db';
const absolutePath = path.resolve(dbPath);

// 确保数据目录存在
const dbDir = path.dirname(absolutePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(absolutePath);

// 启用外键约束
sqlite.exec('PRAGMA foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export { sqlite };
export * from './schema';
