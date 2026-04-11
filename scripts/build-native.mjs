#!/usr/bin/env node
/**
 * @fileoverview 原生模块构建脚本
 * @description 在 pnpm install 后自动编译 better-sqlite3 原生绑定
 * @usage node scripts/build-native.mjs
 */

import { existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';

const root = resolve(import.meta.dirname, '..');
const pnpmDir = resolve(root, 'node_modules/.pnpm');

if (!existsSync(pnpmDir)) {
  console.log('[native] node_modules/.pnpm 不存在，跳过');
  process.exit(0);
}

// 查找 better-sqlite3 目录
const bsqDir = readdirSync(pnpmDir).find(d => d.startsWith('better-sqlite3@'));
if (!bsqDir) {
  console.log('[native] better-sqlite3 未安装，跳过');
  process.exit(0);
}

const bsqPath = join(pnpmDir, bsqDir, 'node_modules/better-sqlite3');
const releaseDir = join(bsqPath, 'build/Release/better_sqlite3.node');

if (existsSync(releaseDir)) {
  console.log('[native] better-sqlite3 已编译，跳过');
  process.exit(0);
}

console.log('[native] 正在编译 better-sqlite3...');
execSync('npm run build-release', { cwd: bsqPath, stdio: 'inherit' });
console.log('[native] ✓ better-sqlite3 编译完成');
