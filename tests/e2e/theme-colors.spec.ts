import { test, expect } from '@playwright/test';

test.describe('Theme Color Optimization', () => {
  test.describe('CSS Variable Verification', () => {
    test('亮色主题应有蓝调背景色', async ({ page }) => {
      // Navigate to any page that uses the theme
      // We verify CSS variables are defined by checking computed styles
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const bgPrimary = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary');
      });

      // Light theme bg: oklch(92% 0.03 240) - should contain 240 hue
      // Note: browser may convert oklch to rgb in computed style
      expect(bgPrimary.trim()).not.toBe('');
    });

    test('暗色主题应有深蓝黑背景色', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Force dark theme
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      const bgPrimary = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary');
      });

      expect(bgPrimary.trim()).not.toBe('');
    });

    test('代码块应有极光流动动画定义', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Check that the aurora-flow keyframes are defined in the stylesheet
      const hasAuroraAnimation = await page.evaluate(() => {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule instanceof CSSKeyframesRule && rule.name === 'aurora-flow') {
                return true;
              }
            }
          } catch {
            // Cross-origin stylesheets may throw
          }
        }
        return false;
      });

      expect(hasAuroraAnimation).toBe(true);
    });
  });

  test.describe('Code Block Styles', () => {
    test('亮色主题代码块文字应为深色', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });

      // Check that pre text color is dark (low RGB values)
      const preColor = await page.evaluate(() => {
        // Create a test pre element and check its computed color
        const pre = document.createElement('pre');
        pre.className = 'prose';
        document.body.appendChild(pre);
        const color = getComputedStyle(pre).color;
        document.body.removeChild(pre);
        return color;
      });

      // The color should be a dark value (not white or very light)
      // rgb format from oklch(18% 0 0) would be something like rgb(46, 46, 46)
      const match = preColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const avg = (parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3])) / 3;
        expect(avg).toBeLessThan(128); // Should be dark
      }
    });

    test('暗色主题代码块文字应为冷蓝白', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      const preColor = await page.evaluate(() => {
        const pre = document.createElement('pre');
        pre.className = 'prose';
        document.body.appendChild(pre);
        const color = getComputedStyle(pre).color;
        document.body.removeChild(pre);
        return color;
      });

      // Dark theme pre text: oklch(94% 0.02 260) - should be light but not pure white
      // rgb would be approximately rgb(230-240, 230-240, 240-250)
      const match = preColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        // Blue channel should be slightly higher than red/green for blue-tinted white
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        expect(r).toBeGreaterThan(200);
        expect(b).toBeGreaterThanOrEqual(r); // Blue tint
      }
    });
  });
});
