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
