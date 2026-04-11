/**
 * @fileoverview Frontmatter 验证测试
 * @description 测试 frontmatter 验证工具的正确性
 */

import { describe, it, expect } from 'vitest';
import {
  validateFrontmatter,
  fillFrontmatterDefaults,
  getMissingFields,
  generateFrontmatterTemplate,
  getFrontmatterErrors,
} from '@utils/frontmatter';

describe('validateFrontmatter', () => {
  it('应该通过有效的 frontmatter', () => {
    const valid = {
      title: '测试文章',
      description: '这是一篇测试文章',
      publishedAt: '2026-04-01',
      category: '技术',
      tags: ['Astro', 'React'],
      draft: false,
      featured: false,
      toc: true,
      readingTime: 'auto',
    };

    const result = validateFrontmatter(valid);
    expect(result.success).toBe(true);
  });

  it('应该拒绝缺少必填字段的 frontmatter', () => {
    const invalid = {
      description: '缺少标题',
    };

    const result = validateFrontmatter(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('应该拒绝无效日期格式', () => {
    const invalid = {
      title: '测试',
      description: '测试',
      publishedAt: 'not-a-date',
      category: '技术',
    };

    const result = validateFrontmatter(invalid);
    expect(result.success).toBe(false);
  });

  it('应该拒绝 tags 不是数组的情况', () => {
    const invalid = {
      title: '测试',
      description: '测试',
      publishedAt: '2026-04-01',
      category: '技术',
      tags: 'not-an-array',
    };

    const result = validateFrontmatter(invalid);
    expect(result.success).toBe(false);
  });

  it('应该允许 draft 为可选字段', () => {
    const valid = {
      title: '测试',
      description: '测试',
      publishedAt: '2026-04-01',
      category: '技术',
    };

    const result = validateFrontmatter(valid);
    expect(result.success).toBe(true);
  });
});

describe('fillFrontmatterDefaults', () => {
  it('应该填充所有默认值', () => {
    const empty = {};
    const filled = fillFrontmatterDefaults(empty);

    expect(filled.title).toBe('未命名文章');
    expect(filled.draft).toBe(true);
    expect(filled.toc).toBe(true);
    expect(filled.readingTime).toBe('auto');
    expect(Array.isArray(filled.tags)).toBe(true);
  });

  it('应该保留已有值', () => {
    const partial = {
      title: '自定义标题',
      category: '教程',
    };

    const filled = fillFrontmatterDefaults(partial);
    expect(filled.title).toBe('自定义标题');
    expect(filled.category).toBe('教程');
    expect(filled.draft).toBe(true); // 默认值
  });
});

describe('getMissingFields', () => {
  it('应该返回所有缺失的必填字段', () => {
    const empty = {};
    const missing = getMissingFields(empty);

    expect(missing).toContain('title');
    expect(missing).toContain('description');
    expect(missing).toContain('publishedAt');
    expect(missing).toContain('category');
  });

  it('应该只返回真正缺失的字段', () => {
    const partial = {
      title: '已有标题',
      description: '已有描述',
    };

    const missing = getMissingFields(partial);
    expect(missing).not.toContain('title');
    expect(missing).not.toContain('description');
    expect(missing).toContain('publishedAt');
    expect(missing).toContain('category');
  });

  it('完整数据应该没有缺失字段', () => {
    const complete = {
      title: '标题',
      description: '描述',
      publishedAt: '2026-04-01',
      category: '技术',
    };

    const missing = getMissingFields(complete);
    expect(missing).toHaveLength(0);
  });
});

describe('generateFrontmatterTemplate', () => {
  it('应该生成默认模板', () => {
    const template = generateFrontmatterTemplate();

    expect(template).toContain('---');
    expect(template).toContain('title:');
    expect(template).toContain('description:');
    expect(template).toContain('publishedAt:');
    expect(template).toContain('draft: true');
  });

  it('应该支持自定义选项', () => {
    const template = generateFrontmatterTemplate({
      title: '自定义标题',
      category: '教程',
      draft: false,
    });

    expect(template).toContain('title: "自定义标题"');
    expect(template).toContain('category: 教程');
    expect(template).toContain('draft: false');
  });
});

describe('getFrontmatterErrors', () => {
  it('有效数据应该返回空字符串', () => {
    const valid = {
      title: '标题',
      description: '描述',
      publishedAt: '2026-04-01',
      category: '技术',
    };

    const errors = getFrontmatterErrors(valid);
    expect(errors).toBe('');
  });

  it('无效数据应该返回错误信息', () => {
    const invalid = {};

    const errors = getFrontmatterErrors(invalid);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('title');
  });
});
