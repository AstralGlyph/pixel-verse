/**
 * @fileoverview 内容 Schema 类型定义
 * @description 导出内容集合的类型定义供其他模块使用
 */

import { z } from 'astro:content';

/**
 * 博客文章 Frontmatter Schema
 */
export const blogFrontmatterSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(50).max(200),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).min(1).max(10),
  category: z.string().min(1),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  cover: z.object({
    src: z.string(),
    alt: z.string().min(1),
  }).optional(),
  toc: z.boolean().default(true),
  readingTime: z.union([z.number(), z.literal('auto')]).default('auto'),
});

/**
 * 博客文章 Frontmatter 类型
 */
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

/**
 * 项目展示 Schema
 */
export const projectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(20).max(500),
  tags: z.array(z.string()).min(1).max(10),
  image: z.string().optional(),
  demoUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

/**
 * 项目展示类型
 */
export type Project = z.infer<typeof projectSchema>;
