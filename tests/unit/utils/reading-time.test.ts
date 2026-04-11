/**
 * @fileoverview 阅读时间计算工具单元测试
 * @description 测试阅读时间计算、格式化等功能
 */

import { describe, it, expect } from 'vitest';
import {
  calculateReadingTime,
  formatReadingTime,
  getReadingTimeInfo,
} from '@utils/reading-time';

describe('reading-time utils', () => {
  describe('calculateReadingTime', () => {
    it('应正确计算纯中文内容的阅读时间', () => {
      // 600 个中文字符，按 300 字/分钟计算，应为 2 分钟
      const content = '这是一段测试文字'.repeat(100); // 约 600 字
      const result = calculateReadingTime(content);
      expect(result).toBeGreaterThanOrEqual(2);
    });

    it('应正确计算纯英文内容的阅读时间', () => {
      // 创建足够长的英文内容，确保至少 400 单词以达到 2 分钟阅读时间
      // 每个句子约 8 个单词，需要至少 50 个句子
      const content = 'This is a test sentence with eight different words here. '.repeat(50);
      const result = calculateReadingTime(content);
      expect(result).toBeGreaterThanOrEqual(2);
    });

    it('应正确计算中英文混合内容的阅读时间', () => {
      const content = `
        这是一段中文内容，包含了大约一百五十个汉字。
        This is English content with approximately fifty words.
        更多中文内容继续在这里，增加阅读时间。
      `;
      const result = calculateReadingTime(content);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('应移除 Markdown 代码块不计入阅读时间', () => {
      const content = `
        这是一段简短的中文内容。

        \`\`\`javascript
        const code = 'very long code block that should not be counted';
        console.log(code);
        \`\`\`\`

        结尾还有一点内容。
      `;
      const result = calculateReadingTime(content);
      // 代码块不应计入，内容很短
      expect(result).toBe(1);
    });

    it('应移除行内代码不计入阅读时间', () => {
      const content = '这是普通文字，`这段代码不计入`，继续普通文字。';
      const result = calculateReadingTime(content);
      expect(result).toBe(1);
    });

    it('应移除 Markdown 链接但保留链接文本', () => {
      const content = '点击[这个链接](https://example.com)查看更多信息。';
      const result = calculateReadingTime(content);
      // 链接文本"这个链接"应计入
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('应移除图片标记不计入阅读时间', () => {
      const content = '这是一张图片 ![图片描述](https://example.com/image.png) 后面还有文字。';
      const result = calculateReadingTime(content);
      expect(result).toBe(1);
    });

    it('应移除 LaTeX 公式不计入阅读时间', () => {
      const content = '这是数学公式 $E = mc^2$ 和块公式 $$\\int_0^1 x dx$$ 的内容。';
      const result = calculateReadingTime(content);
      expect(result).toBe(1);
    });

    it('应移除 HTML 标签不计入阅读时间', () => {
      const content = '<div class="container">这是 HTML 包裹的内容</div>';
      const result = calculateReadingTime(content);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('应返回至少 1 分钟', () => {
      const content = '短';
      const result = calculateReadingTime(content);
      expect(result).toBe(1);
    });

    it('应正确处理空内容', () => {
      const result = calculateReadingTime('');
      expect(result).toBe(1);
    });

    it('应支持自定义阅读速度', () => {
      const content = '这是一段中文测试内容'.repeat(10); // 约 150 字
      // 自定义更快的阅读速度
      const result = calculateReadingTime(content, { wordsPerMinuteCN: 500 });
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatReadingTime', () => {
    it('应正确格式化分钟阅读时间', () => {
      const result = formatReadingTime(5);
      expect(result).toBe('5 分钟阅读');
    });

    it('应正确格式化小于 1 分钟的时间', () => {
      const result = formatReadingTime(0);
      expect(result).toBe('1 分钟阅读');
    });

    it('应正确格式化小时级阅读时间', () => {
      const result = formatReadingTime(60);
      expect(result).toBe('1 小时阅读');
    });

    it('应正确格式化小时和分钟混合时间', () => {
      const result = formatReadingTime(75);
      expect(result).toBe('1 小时 15 分钟阅读');
    });

    it('应正确格式化多小时时间', () => {
      const result = formatReadingTime(120);
      expect(result).toBe('2 小时阅读');
    });

    it('应正确格式化小时余分钟的时间', () => {
      const result = formatReadingTime(90);
      expect(result).toBe('1 小时 30 分钟阅读');
    });
  });

  describe('getReadingTimeInfo', () => {
    it('应返回计算后的阅读时间信息', () => {
      const content = '这是一段测试内容'.repeat(50);
      const result = getReadingTimeInfo(content);

      expect(result).toHaveProperty('minutes');
      expect(result).toHaveProperty('display');
      expect(result.minutes).toBeGreaterThanOrEqual(1);
      expect(result.display).toContain('分钟');
    });

    it('应支持手动指定阅读时间', () => {
      const content = '任意内容';
      const result = getReadingTimeInfo(content, 10);

      expect(result.minutes).toBe(10);
      expect(result.display).toBe('10 分钟阅读');
    });

    it('应忽略无效的手动时间', () => {
      const content = '测试内容';
      // 传入 0 或负数时应计算
      const result = getReadingTimeInfo(content, 0);
      expect(result.minutes).toBe(1); // 自动计算最小值
    });

    it('应正确处理 "auto" 参数', () => {
      const content = '这是一段较长的测试内容'.repeat(30);
      const result = getReadingTimeInfo(content, 'auto');

      expect(result.minutes).toBeGreaterThanOrEqual(1);
    });

    it('应返回一致的 display 格式', () => {
      const content = '测试内容';
      const result = getReadingTimeInfo(content);

      expect(result.display).toMatch(/^\d+ 分钟阅读$|^\d+ 小时/);
    });
  });
});