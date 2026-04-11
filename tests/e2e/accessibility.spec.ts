/**
 * @fileoverview 无障碍访问 E2E 测试
 * @description 验证 WCAG 2.2 AA 级合规性
 * @description 测试键盘导航、屏幕阅读器语义化标记、焦点管理
 */

import { test, expect } from '@playwright/test';

test.describe('无障碍访问 - 全局', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该存在 Skip Navigation 链接', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible({ visible: false }); // sr-only 但存在于 DOM

    // 聚焦时应该可见
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('主内容区域应该有 id="main-content"', async ({ page }) => {
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('HTML 应该设置正确的 lang 属性', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'zh-CN');
  });

  test('所有页面应该有 title 标签', async ({ page }) => {
    await expect(page).toHaveTitle(/.*\| PixelVerse/);
  });
});

test.describe('无障碍访问 - 导航栏', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('导航栏应该使用 nav 元素', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
  });

  test('移动端菜单按钮应该有 aria-expanded 和 aria-controls', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuToggle = page.locator('#mobile-menu-toggle');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menuToggle).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  test('所有链接应该有可访问的名称', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const accessibleName = text?.trim() || ariaLabel;
      expect(accessibleName).toBeTruthy();
    }
  });
});

test.describe('无障碍访问 - 命令面板', () => {
  test('应该可以通过键盘打开命令面板', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('命令面板应该有正确的 ARIA 属性', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-label', '命令面板');
  });

  test('命令面板应该可以通过 Escape 关闭', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('命令面板应该支持键盘导航', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');

    // 应该自动聚焦到搜索输入框
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await expect(searchInput).toBeFocused();
  });
});

test.describe('无障碍访问 - 主题切换', () => {
  test('主题切换按钮应该有正确的 ARIA 属性', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('[aria-label="切换主题"]');
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(themeToggle).toHaveAttribute('aria-haspopup', 'listbox');
  });

  test('主题选项面板应该有 role="listbox"', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('[aria-label="切换主题"]');
    await themeToggle.click();

    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();
  });
});

test.describe('无障碍访问 - 文章内容', () => {
  test('文章页面应该有目录导航', async ({ page }) => {
    await page.goto('/blog/welcome-to-pixelverse/');

    const toc = page.locator('[aria-label="目录导航"]');
    await expect(toc).toBeVisible();
  });

  test('文章页面应该有阅读进度条', async ({ page }) => {
    await page.goto('/blog/welcome-to-pixelverse/');

    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('Callout 组件应该有正确的 role', async ({ page }) => {
    await page.goto('/blog/welcome-to-pixelverse/');

    // info 类型应该使用 role="note"
    const infoCallouts = page.locator('[role="note"]');
    await expect(infoCallouts).toHaveCount(1);

    // warn/error 类型应该使用 role="alert"
    const alertCallouts = page.locator('[role="alert"]');
    await expect(alertCallouts).toHaveCount(1);
  });

  test('Tabs 组件应该有正确的 ARIA 属性', async ({ page }) => {
    await page.goto('/blog/welcome-to-pixelverse/');

    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // 第一个 tab 应该被选中
    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Accordion 组件应该有正确的 ARIA 属性', async ({ page }) => {
    await page.goto('/blog/welcome-to-pixelverse/');

    const triggers = page.locator('[aria-expanded]');
    const accordionTriggers = triggers.filter({ hasText: /点击展开/ });
    const count = await accordionTriggers.count();
    expect(count).toBeGreaterThan(0);

    // 第一个应该默认展开
    const firstTrigger = accordionTriggers.first();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('无障碍访问 - 键盘导航', () => {
  test('应该可以通过 Tab 键完整导航页面', async ({ page }) => {
    await page.goto('/');

    // 连续按 Tab 键，确保焦点在页面上移动
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const activeElement = page.locator(':focus');
      await expect(activeElement).toBeVisible();
    }
  });

  test('焦点不应该被隐藏在页面上', async ({ page }) => {
    await page.goto('/');

    // 获取当前焦点元素
    const focusedElement = page.locator(':focus');

    // 焦点元素不应该是 display: none 或 visibility: hidden
    const isVisible = await focusedElement.isVisible();
    expect(isVisible).toBe(true);
  });

  test('交互式元素应该有正确的键盘支持', async ({ page }) => {
    await page.goto('/');

    // 所有按钮应该可以通过 Enter/Space 激活
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i);
      await button.focus();
      await page.keyboard.press('Enter');
      // 不应该抛出错误
    }
  });
});

test.describe('无障碍访问 - 对比度和颜色', () => {
  test('页面应该有明确的文本对比度', async ({ page }) => {
    await page.goto('/');

    // 检查主要文本元素的颜色
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const heading = headings.nth(i);
      const color = await heading.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.color;
      });

      // 颜色不应该是透明的
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});

test.describe('无障碍访问 - 404 页面', () => {
  test('404 页面应该可以访问', async ({ page }) => {
    await page.goto('/non-existent-page/');

    // 应该显示 404 页面
    const heading = page.locator('h1');
    await expect(heading).toContainText('404');

    // 应该有返回首页的链接
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });
});
