/**
 * @fileoverview 日期工具函数单元测试
 * @description 测试日期格式化、相对时间计算等功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  formatArticleDate,
  isWithinDays,
} from '@utils/date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('应正确格式化 ISO 日期字符串', () => {
      const result = formatDate('2024-03-15');
      expect(result).toBe('2024-03-15');
    });

    it('应正确格式化 Date 对象', () => {
      const date = new Date('2024-03-15T10:30:00');
      const result = formatDate(date);
      expect(result).toBe('2024-03-15');
    });

    it('应支持自定义格式字符串', () => {
      const result = formatDate('2024-03-15', 'yyyy年MM月dd日');
      expect(result).toBe('2024年03月15日');
    });

    it('应正确格式化包含时间的日期', () => {
      const result = formatDate('2024-03-15T14:30:00', 'yyyy-MM-dd HH:mm');
      expect(result).toBe('2024-03-15 14:30');
    });

    it('应返回空字符串处理无效日期', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('');
    });

    it('应返回空字符串处理空值', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('应使用中文 locale', () => {
      // 使用中文格式化月份名称
      const result = formatDate('2024-03-15', 'MMMM');
      expect(result).toBe('三月');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // 固定当前时间以确保测试可重复
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-20T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应正确格式化近期的相对时间', () => {
      const result = formatRelativeTime('2024-03-18');
      expect(result).toContain('天前');
    });

    it('应正确格式化今天的日期', () => {
      const result = formatRelativeTime('2024-03-20');
      expect(result).toContain('小时前');
    });

    it('应正确格式化过去的日期', () => {
      const result = formatRelativeTime('2024-03-01');
      // date-fns 中文 locale 格式化结果可能包含"大约"或直接显示天数
      expect(result).toMatch(/大约|天前|个月前/);
    });

    it('应返回空字符串处理无效日期', () => {
      const result = formatRelativeTime('invalid-date');
      expect(result).toBe('');
    });

    it('应使用中文 locale 显示相对时间', () => {
      const result = formatRelativeTime('2024-03-19');
      expect(result).toMatch(/大约|天前|小时前/);
    });
  });

  describe('formatArticleDate', () => {
    it('应正确格式化发布日期', () => {
      const result = formatArticleDate('2024-03-15');
      expect(result.published).toBe('2024-03-15');
      expect(result.updated).toBeUndefined();
    });

    it('应正确格式化发布和更新日期', () => {
      const result = formatArticleDate('2024-03-15', '2024-03-20');
      expect(result.published).toBe('2024-03-15');
      expect(result.updated).toBe('2024-03-20');
    });

    it('应支持 Date 对象输入', () => {
      const published = new Date('2024-03-15');
      const updated = new Date('2024-03-20');
      const result = formatArticleDate(published, updated);
      expect(result.published).toBe('2024-03-15');
      expect(result.updated).toBe('2024-03-20');
    });

    it('应正确处理无效更新日期', () => {
      const result = formatArticleDate('2024-03-15', 'invalid-date');
      expect(result.published).toBe('2024-03-15');
      expect(result.updated).toBe('');
    });
  });

  describe('isWithinDays', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-20T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应返回 true 当日期在指定天数内', () => {
      const result = isWithinDays('2024-03-18', 3);
      expect(result).toBe(true);
    });

    it('应返回 false 当日期超过指定天数', () => {
      const result = isWithinDays('2024-03-15', 3);
      expect(result).toBe(false);
    });

    it('应正确处理今天的日期', () => {
      const result = isWithinDays('2024-03-20', 1);
      expect(result).toBe(true);
    });

    it('应返回 false 处理无效日期', () => {
      const result = isWithinDays('invalid-date', 3);
      expect(result).toBe(false);
    });

    it('应支持 Date 对象输入', () => {
      const date = new Date('2024-03-19T12:00:00');
      const result = isWithinDays(date, 2);
      expect(result).toBe(true);
    });

    it('应正确处理边界情况（恰好等于天数）', () => {
      // 3 天前的同一时间
      const result = isWithinDays('2024-03-17T12:00:00', 3);
      expect(result).toBe(true);
    });

    it('应正确处理未来日期', () => {
      const result = isWithinDays('2024-03-25', 3);
      expect(result).toBe(true); // 未来日期被视为在范围内（负差值）
    });
  });
});