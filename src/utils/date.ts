/**
 * 日期处理工具函数
 * @module utils/date
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期
 * @param date - 日期字符串或 Date 对象
 * @param formatStr - 格式字符串，默认 'yyyy-MM-dd'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'yyyy-MM-dd'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) {
    return '';
  }
  return format(d, formatStr, { locale: zhCN });
}

/**
 * 格式化为相对时间（如：3 天前）
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) {
    return '';
  }
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

/**
 * 格式化文章日期显示
 * - 发布日期：显示完整日期
 * - 更新日期：显示"最后更新于 X"
 * @param publishedAt - 发布日期
 * @param updatedAt - 更新日期（可选）
 * @returns 格式化后的日期信息
 */
export function formatArticleDate(
  publishedAt: string | Date,
  updatedAt?: string | Date
): { published: string; updated?: string } {
  const result = {
    published: formatDate(publishedAt),
    updated: updatedAt ? formatDate(updatedAt) : undefined,
  };
  return result;
}

/**
 * 检查日期是否在指定天数内
 * @param date - 日期字符串或 Date 对象
 * @param days - 天数
 * @returns 是否在指定天数内
 */
export function isWithinDays(date: string | Date, days: number): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) {
    return false;
  }
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}