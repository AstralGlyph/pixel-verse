/**
 * @fileoverview 离线阅读 E2E 测试
 * @description 测试 PWA Service Worker 注册、缓存策略和离线回退
 */

import { test, expect } from '@playwright/test';

test.describe('PWA - 离线阅读', () => {
  test('Service Worker 注册成功', async ({ page }) => {
    await page.goto('/');

    // 等待 Service Worker 注册
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.ready;
      return !!registration;
    });

    expect(swRegistered).toBe(true);
  });

  test('manifest.json 存在且有效', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest?.name).toContain('PixelVerse');
    expect(manifest?.short_name).toBe('PixelVerse');
    expect(manifest?.start_url).toBe('/');
    expect(manifest?.display).toBe('standalone');
  });

  test('离线页面可访问', async ({ page }) => {
    await page.goto('/offline');
    await expect(page).toHaveTitle(/离线/);
    await expect(page.getByText('你已离线')).toBeVisible();
    await expect(page.getByRole('button', { name: '重新加载' })).toBeVisible();
  });

  test('静态资源缓存策略', async ({ page, context }) => {
    // 首次访问，缓存资源
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证关键资源已缓存
    const cachedResources = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const caches_data: Record<string, string[]> = {};
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        caches_data[name] = requests.map((r) => r.url);
      }
      return caches_data;
    });

    // 至少有一个缓存
    const cacheNames = Object.keys(cachedResources);
    expect(cacheNames.length).toBeGreaterThan(0);
  });
});
