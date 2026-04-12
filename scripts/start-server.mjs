/**
 * @fileoverview 自定义启动脚本
 * @description 强制服务器绑定到 0.0.0.0，适配 Render 等云平台部署
 * @usage node scripts/start-server.mjs
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler } from '../dist/server/entry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.join(__dirname, '..', 'dist', 'client');

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

/**
 * 提供静态文件服务
 */
function serveStatic(req, res) {
  let filePath = path.join(CLIENT_DIR, req.url.split('?')[0]);

  // 安全检查：防止路径遍历
  if (!filePath.startsWith(CLIENT_DIR)) {
    return false;
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filePath).pipe(res);
      return true;
    }
  } catch {
    // 文件不存在
  }
  return false;
}

/**
 * 主请求处理器
 */
const requestHandler = (req, res) => {
  try {
    decodeURI(req.url);
  } catch {
    res.writeHead(400);
    res.end('Bad request.');
    return;
  }

  // 优先尝试静态文件
  if (serveStatic(req, res)) {
    return;
  }

  // 否则走 SSR handler
  handler(req, res);
};

const server = http.createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`🚀 服务器已启动: http://${HOST}:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => process.exit(0));
});
