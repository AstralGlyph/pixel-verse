/**
 * @fileoverview Frontmatter 验证工具
 * @description 验证 MDX 文章的 frontmatter 是否符合 schema 要求
 * @description 提供类型安全的 frontmatter 校验和默认值填充
 * @dependencies content/schema
 * @example
 * import { validateFrontmatter } from '@utils/frontmatter';
 * const result = validateFrontmatter(rawFrontmatter);
 * if (result.success) { console.log(result.data); }
 */

import type { BlogFrontmatter } from '@content/schema';

/**
 * 校验结果类型
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> };

/**
 * 验证 frontmatter 数据（基础校验，不依赖 zod 运行时）
 *
 * @param raw - 原始 frontmatter 对象
 * @returns 校验结果
 */
export function validateFrontmatter(
  raw: Record<string, unknown>
): ValidationResult<BlogFrontmatter> {
  const errors: Array<{ field: string; message: string }> = [];

  // 必填字段校验
  if (!raw.title || typeof raw.title !== 'string') {
    errors.push({ field: 'title', message: '标题为必填项' });
  } else if (raw.title.length < 1 || raw.title.length > 100) {
    errors.push({ field: 'title', message: '标题长度必须在 1-100 个字符之间' });
  }

  if (!raw.description || typeof raw.description !== 'string') {
    errors.push({ field: 'description', message: '描述为必填项' });
  } else if (raw.description.length < 50 || raw.description.length > 200) {
    errors.push({ field: 'description', message: '描述长度必须在 50-200 个字符之间' });
  }

  if (!raw.publishedAt) {
    errors.push({ field: 'publishedAt', message: '发布日期为必填项' });
  } else {
    const date = new Date(raw.publishedAt as string);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'publishedAt', message: '发布日期格式无效' });
    }
  }

  if (!raw.category || typeof raw.category !== 'string') {
    errors.push({ field: 'category', message: '分类为必填项' });
  }

  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags)) {
      errors.push({ field: 'tags', message: '标签必须是数组' });
    } else if (raw.tags.length < 1 || raw.tags.length > 10) {
      errors.push({ field: 'tags', message: '标签数量必须在 1-10 个之间' });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title: raw.title as string,
      description: raw.description as string,
      publishedAt: new Date(raw.publishedAt as string),
      category: raw.category as string,
      tags: (raw.tags as string[]) || [],
      draft: Boolean(raw.draft),
      featured: Boolean(raw.featured),
      toc: raw.toc !== undefined ? Boolean(raw.toc) : true,
      readingTime: (raw.readingTime as number | 'auto') || 'auto',
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string) : undefined,
      cover: raw.cover as BlogFrontmatter['cover'],
    },
  };
}

/**
 * 填充 frontmatter 默认值
 *
 * @param raw - 原始 frontmatter 对象
 * @returns 填充默认值后的对象
 */
export function fillFrontmatterDefaults(
  raw: Record<string, unknown>
): Record<string, unknown> {
  return {
    title: raw.title || '未命名文章',
    description: raw.description || '',
    publishedAt: raw.publishedAt || new Date().toISOString(),
    category: raw.category || '技术',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    draft: raw.draft !== undefined ? Boolean(raw.draft) : true,
    featured: Boolean(raw.featured),
    toc: raw.toc !== undefined ? Boolean(raw.toc) : true,
    readingTime: raw.readingTime || 'auto',
    cover: raw.cover || undefined,
    updatedAt: raw.updatedAt || undefined,
  };
}

/**
 * 检查 frontmatter 是否包含必填字段
 *
 * @param raw - 原始 frontmatter 对象
 * @returns 缺失字段列表
 */
export function getMissingFields(raw: Record<string, unknown>): string[] {
  const requiredFields = ['title', 'description', 'publishedAt', 'category'];
  return requiredFields.filter((field) => !raw[field]);
}

/**
 * 生成 frontmatter 模板
 *
 * @param options - 可选的自定义字段
 * @returns 格式化的 frontmatter 字符串
 */
export function generateFrontmatterTemplate(
  options: Record<string, string | boolean | string[]> = {}
): string {
  const template = {
    title: options.title || '文章标题',
    description: options.description || '文章简短描述',
    publishedAt: options.publishedAt || new Date().toISOString().split('T')[0],
    category: options.category || '技术',
    tags: options.tags || ['标签1', '标签2'],
    draft: options.draft !== undefined ? options.draft : true,
    featured: false,
    toc: true,
    readingTime: 'auto',
    cover: {
      src: '/images/blog/cover.png',
      alt: '文章封面图片',
    },
  };

  return `---\n${JSON.stringify(template, null, 2)}\n---\n`;
}

/**
 * 校验 frontmatter 并返回人类可读的错误信息
 *
 * @param raw - 原始 frontmatter 对象
 * @returns 错误信息字符串，无错误时返回空字符串
 */
export function getFrontmatterErrors(raw: Record<string, unknown>): string {
  const result = validateFrontmatter(raw);

  if (result.success) {
    return '';
  }

  return result.errors
    .map((err) => `- ${err.field}: ${err.message}`)
    .join('\n');
}
