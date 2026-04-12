#!/usr/bin/env node

/**
 * @fileoverview PixelVerse 一键启动脚本
 * @description 自动检查依赖安装、端口占用，支持 Ctrl+C 快速终止
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEV_PORT = 4321;

// ANSI 颜色
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg, color = '') {
  console.log(`${color}${BOLD}[PixelVerse]${RESET} ${msg}`);
}

/**
 * 检查 node_modules 是否存在
 */
function checkDependencies() {
  if (!existsSync(resolve(ROOT, 'node_modules'))) {
    log('未检测到 node_modules，正在安装依赖...', YELLOW);
    return new Promise((resolve) => {
      const pm = existsSync(resolve(ROOT, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';
      const cmd = pm === 'pnpm' ? 'pnpm' : 'npm';
      const args = pm === 'pnpm' ? ['install'] : ['install'];
      const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit' });
      child.on('exit', (code) => {
        if (code === 0) {
          log('依赖安装完成', GREEN);
          resolve(true);
        } else {
          log('依赖安装失败，请手动运行 pnpm install', RED);
          resolve(false);
        }
      });
    });
  }
  log('依赖已就绪', GREEN);
  return Promise.resolve(true);
}

/**
 * 检查端口是否被占用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(false));
    });
    server.on('error', () => resolve(true));
  });
}

/**
 * 查找并终止占用端口的进程
 */
function killPort(port) {
  return new Promise((resolve, reject) => {
    const child = spawn('lsof', ['-ti', `:${port}`], { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.on('close', (code) => {
      if (code === 0 && output.trim()) {
        const pids = output.trim().split('\n');
        log(`端口 ${port} 被占用，正在终止进程: ${pids.join(', ')}`, YELLOW);
        const kill = spawn('kill', ['-9', ...pids]);
        kill.on('close', () => {
          // 等待端口释放
          setTimeout(resolve, 500);
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * 启动开发服务器
 */
function startDevServer() {
  log(`启动开发服务器 http://localhost:${DEV_PORT}`, CYAN);
  log('按 Ctrl+C 停止服务器', YELLOW);

  const child = spawn('npx', ['astro', 'dev'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, PORT: String(DEV_PORT) },
  });

  let shuttingDown = false;

  // Ctrl+C 处理
  process.on('SIGINT', () => {
    if (shuttingDown) return;
    shuttingDown = true;
    log('正在停止开发服务器...', YELLOW);
    child.kill('SIGINT');
    // 如果子进程没有退出，强制终止
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
      process.exit(0);
    }, 2000);
  });

  process.on('SIGTERM', () => {
    if (shuttingDown) return;
    shuttingDown = true;
    child.kill('SIGTERM');
    process.exit(0);
  });

  child.on('exit', (code, signal) => {
    // Ctrl+C 或正常退出都视为正常退出
    if (shuttingDown || signal === 'SIGINT' || signal === 'SIGTERM') {
      process.exit(0);
    }
    process.exit(code ?? 0);
  });
}

/**
 * 主流程
 */
async function main() {
  console.log('');
  log('PixelVerse 开发环境启动中...', CYAN);
  console.log('');

  // 1. 检查依赖
  const depsOk = await checkDependencies();
  if (!depsOk) process.exit(1);

  // 2. 检查端口
  const portInUse = await checkPort(DEV_PORT);
  if (portInUse) {
    log(`端口 ${DEV_PORT} 已被占用，正在释放...`, YELLOW);
    await killPort(DEV_PORT);
  }

  // 3. 启动开发服务器
  startDevServer();
}

main().catch((err) => {
  log(`启动失败: ${err.message}`, RED);
  process.exit(1);
});
