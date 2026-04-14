/**
 * @fileoverview URL Slug 生成工具
 * @description 从标题自动生成 URL 安全的别名
 */

/**
 * 从标题生成 URL 安全的 slug
 * - 转换为小写
 * - 非字母数字字符替换为连字符
 * - 去除首尾连字符
 * - 多个连续连字符合并为一个
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 确保 slug 唯一，如果不唯一则添加数字后缀
 */
export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
  return uniqueSlug;
}

/**
 * 验证 slug 是否有效（URL 安全）
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * 为标题生成唯一的 slug（支持中英文）
 * - 英文标题：使用 generateSlug 生成 kebab-case slug
 * - 中文标题：使用 URL 编码去除 % 后的小写字符串
 * - 空标题：生成临时唯一 ID
 */
export function generateHeadingSlug(text: string, existingSlugs: string[]): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return `heading-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  // 先尝试用 generateSlug 生成（处理英文/拼音标题）
  const baseSlug = generateSlug(trimmed);
  if (baseSlug) {
    return ensureUniqueSlug(baseSlug, existingSlugs);
  }

  // 中文标题回退：使用 URL 编码移除 % 后转小写
  const fallback = encodeURIComponent(trimmed).replace(/%/g, '').toLowerCase();
  return ensureUniqueSlug(fallback, existingSlugs);
}
