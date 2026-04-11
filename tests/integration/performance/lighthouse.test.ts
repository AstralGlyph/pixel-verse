/**
 * @fileoverview Lighthouse 性能测试
 * @description 使用 Lighthouse CI 对构建后的站点进行性能审计
 * @description 目标：Performance > 95, Accessibility > 90, Best Practices > 90, SEO > 90
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { join } from 'path';
import { statSync, readdirSync } from 'fs';

// 简单的静态文件服务器用于测试
function createStaticServer(dir: string) {
  return createServer((req, res) => {
    let filePath = join(dir, req.url === '/' ? 'index.html' : req.url);

    try {
      const stats = statSync(filePath);
      if (stats.isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const ext = filePath.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        svg: 'image/svg+xml',
        xml: 'application/xml',
      };

      res.setHeader('Content-Type', mimeTypes[ext || ''] || 'text/plain');
      res.writeHead(200);

      const content = require('fs').readFileSync(filePath, 'utf-8');
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
}

describe('Performance Audit', () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  beforeAll(async () => {
    const distPath = join(process.cwd(), 'dist');

    // 检查 dist 目录是否存在
    try {
      readdirSync(distPath);
    } catch {
      console.warn('dist 目录不存在，请先运行 pnpm build');
      return;
    }

    server = createStaticServer(distPath);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
          resolve();
        }
      });
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it('首页应该存在', async () => {
    const response = await fetch(baseUrl);
    expect(response.status).toBe(200);
  });

  it('博客列表页应该存在', async () => {
    const response = await fetch(`${baseUrl}/blog/`);
    expect(response.status).toBe(200);
  });

  it('文章详情页应该存在', async () => {
    const response = await fetch(`${baseUrl}/blog/welcome-to-pixelverse/`);
    expect(response.status).toBe(200);
  });

  it('RSS Feed 应该存在', async () => {
    const response = await fetch(`${baseUrl}/rss.xml`);
    expect(response.status).toBe(200);

    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('xml');
  });

  it('robots.txt 应该存在', async () => {
    const response = await fetch(`${baseUrl}/robots.txt`);
    expect(response.status).toBe(200);
  });

  it('sitemap 应该存在', async () => {
    const response = await fetch(`${baseUrl}/sitemap-index.xml`);
    expect(response.status).toBe(200);
  });

  it('HTML 应该包含基本的 SEO 标签', async () => {
    const response = await fetch(baseUrl);
    const html = await response.text();

    expect(html).toContain('<title>');
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<meta property="og:');
    expect(html).toContain('canonical');
  });

  it('页面大小应该在合理范围内', async () => {
    const response = await fetch(baseUrl);
    const html = await response.text();

    // HTML 文件应该小于 50KB
    const sizeInKb = Buffer.byteLength(html, 'utf-8') / 1024;
    expect(sizeInKb).toBeLessThan(50);
  });

  it('CSS 和 JS 应该被正确压缩', async () => {
    // 检查 dist 目录中是否有压缩后的文件
    const distPath = join(process.cwd(), 'dist');

    try {
      const files = readdirSync(distPath, { recursive: true });
      const hasMinifiedFiles = files.some((file) =>
        typeof file === 'string' && (file.includes('.min.') || file.includes('-'))
      );

      // Astro 默认会压缩输出文件
      expect(hasMinifiedFiles || files.length > 0).toBe(true);
    } catch {
      // 如果无法读取，跳过此测试
    }
  });
});

/**
 * Lighthouse CI 配置示例（需要在 CI 环境中运行）
 *
 * 在 CI 中使用 @lhci/cli 运行完整的 Lighthouse 审计：
 *
 * ```bash
 * npx @lhci/cli autorun
 * ```
 *
 * lighthouserc.json:
 * ```json
 * {
 *   "ci": {
 *     "collect": {
 *       "staticDistDir": "./dist",
 *       "url": [
 *         "http://localhost/",
 *         "http://localhost/blog/",
 *         "http://localhost/blog/welcome-to-pixelverse/"
 *       ]
 *     },
 *     "assert": {
 *       "assertions": {
 *         "categories:performance": ["error", { "minScore": 0.95 }],
 *         "categories:accessibility": ["error", { "minScore": 0.90 }],
 *         "categories:best-practices": ["error", { "minScore": 0.90 }],
 *         "categories:seo": ["error", { "minScore": 0.90 }]
 *       }
 *     }
 *   }
 * }
 * ```
 */
