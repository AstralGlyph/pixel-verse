/**
 * 内容处理工具函数
 * @module utils/content
 */

import matter from 'gray-matter';
import type { BlogFrontmatter } from '@content/schema';

/**
 * 解析 MDX Frontmatter
 * @param rawContent - 原始 MDX 内容
 * @returns 解析后的 frontmatter 和内容
 */
export function parseFrontmatter(rawContent: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const { data, content } = matter(rawContent);
  return {
    frontmatter: data,
    content,
  };
}

/**
 * 生成文章 Slug
 * @param title - 文章标题
 * @returns URL 友好的 slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 替换非字母数字和中文字符
    .replace(/^-+|-+$/g, '') // 移除首尾连字符
    .slice(0, 100); // 限制长度
}

/**
 * 获取文章摘要
 * @param content - 文章内容
 * @param maxLength - 最大长度
 * @returns 文章摘要
 */
export function getExcerpt(content: string, maxLength: number = 160): string {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~>|-]/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // 在句子边界截断
  const truncated = plainText.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？')
  );

  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}

/**
 * 提取文章标题
 * @param content - 文章内容
 * @returns 第一个标题
 */
export function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * 提取文章中的所有标题
 * @param content - 文章内容
 * @returns 标题列表
 */
export function extractHeadings(
  content: string
): Array<{ level: number; text: string; slug: string }> {
  const headings: Array<{ level: number; text: string; slug: string }> = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = generateSlug(text);
    headings.push({ level, text, slug });
  }

  return headings;
}

/**
 * 计算文章字数
 * @param content - 文章内容
 * @returns 字数统计
 */
export function countWords(content: string): {
  chinese: number;
  english: number;
  total: number;
} {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~>|-]/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]*>/g, '');

  const chinese = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = plainText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return {
    chinese,
    english,
    total: chinese + english,
  };
}

/**
 * 验证 Frontmatter 完整性
 * @param frontmatter - Frontmatter 对象
 * @returns 验证结果
 */
export function validateFrontmatter(
  frontmatter: Partial<BlogFrontmatter>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!frontmatter.title || frontmatter.title.length === 0) {
    errors.push('缺少标题 (title)');
  }

  if (!frontmatter.description || frontmatter.description.length < 50) {
    errors.push('描述 (description) 至少需要 50 个字符');
  }

  if (!frontmatter.publishedAt) {
    errors.push('缺少发布日期 (publishedAt)');
  }

  if (!frontmatter.tags || frontmatter.tags.length === 0) {
    errors.push('至少需要一个标签 (tags)');
  }

  if (!frontmatter.category) {
    errors.push('缺少分类 (category)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}