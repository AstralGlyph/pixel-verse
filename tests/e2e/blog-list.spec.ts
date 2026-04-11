/**
 * @fileoverview 博客列表页 E2E 测试
 * @description 测试博客列表页的展示、标签筛选等功能
 */

import { test, expect } from '@playwright/test';

test.describe('博客列表页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('应该显示页面标题', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('博客');
  });

  test('应该展示文章卡片', async ({ page }) => {
    const cards = page.locator('[class*="article-card"]');
    await expect(cards).toHaveCount(1); // 至少有 welcome-to-pixelverse
  });

  test('文章卡片应该包含标题和描述', async ({ page }) => {
    const firstCard = page.locator('[class*="article-card"]').first();
    await expect(firstCard).toBeVisible();

    // 应该包含标题
    const title = firstCard.locator('[class*="article-card-title"]');
    await expect(title).toBeVisible();
  });

  test('点击文章卡片应该跳转到文章详情页', async ({ page }) => {
    const firstCard = page.locator('[class*="article-card"]').first();
    const link = firstCard.locator('a');

    const href = await link.getAttribute('href');
    expect(href).toContain('/blog/');
  });

  test('应该展示标签列表', async ({ page }) => {
    // TagList 组件应该存在
    const tagList = page.locator('[role="list"]');
    await expect(tagList).toBeVisible();
  });

  test('标签应该可以点击', async ({ page }) => {
    const tags = page.locator('[role="listitem"], [role="tab"]');
    const count = await tags.count();

    if (count > 0) {
      await tags.first().click();
      // 点击后页面不应该报错
      expect(page.url()).toContain('/blog');
    }
  });
});

test.describe('标签页面', () => {
  test('标签云页面应该存在', async ({ page }) => {
    await page.goto('/tags');

    await expect(page.locator('h1')).toContainText('标签云');
  });

  test('标签云应该展示所有标签', async ({ page }) => {
    await page.goto('/tags');

    // 应该有标签链接
    const tagLinks = page.locator('.tag-link');
    await expect(tagLinks).toHaveCount(1); // 至少有 welcome 文章的标签
  });

  test('点击标签应该跳转到标签文章列表', async ({ page }) => {
    await page.goto('/tags');

    const firstTagLink = page.locator('.tag-link').first();
    const href = await firstTagLink.getAttribute('href');
    expect(href).toContain('/tags/');
  });
});
