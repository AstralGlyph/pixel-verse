/**
 * @fileoverview RSS Feed 生成页面
 * @description 自动生成全站 RSS Feed，支持阅读器订阅
 * @dependencies @astrojs/rss, astro:content
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).valueOf() - new Date(a.data.publishedAt).valueOf()
  );

  return rss({
    title: 'PixelVerse | 内容即体验',
    description: '内容即体验的个人博客系统。每篇文章都是一次独立的体验，每次访问都有新的发现。',
    site: context.site || 'https://pixelverse.blog',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.publishedAt),
      link: `/blog/${post.slug}/`,
      categories: post.data.tags || [],
      customData: '',
    })),
    customData: `
      <language>zh-CN</language>
      <copyright>© ${new Date().getFullYear()} PixelVerse. All rights reserved.</copyright>
    `,
  });
}
