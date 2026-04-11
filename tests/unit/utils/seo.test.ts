/**
 * @fileoverview SEO 工具函数单元测试
 * @description 测试 SEO meta 标签生成、JSON-LD 结构化数据等功能
 */

import { describe, it, expect } from 'vitest';
import {
  generatePageTitle,
  generateMetaTags,
  generateJsonLD,
  generateWebsiteJsonLD,
  generateBreadcrumbJsonLD,
} from '@utils/seo';

describe('seo utils', () => {
  describe('generatePageTitle', () => {
    it('应正确生成页面标题', () => {
      const result = generatePageTitle('文章标题');
      expect(result).toBe('文章标题 | PixelVerse');
    });

    it('应支持自定义站点名称', () => {
      const result = generatePageTitle('文章标题', '我的博客');
      expect(result).toBe('文章标题 | 我的博客');
    });

    it('应仅返回站点名称处理空标题', () => {
      const result = generatePageTitle('');
      expect(result).toBe('PixelVerse');
    });

    it('应正确处理特殊字符标题', () => {
      const result = generatePageTitle('标题 <特殊> & 字符');
      expect(result).toContain('标题');
      expect(result).toContain('PixelVerse');
    });
  });

  describe('generateMetaTags', () => {
    it('应生成基础 meta 标签', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ name: 'description', content: '测试描述' });
      expect(result).toContainEqual({ property: 'og:title', content: '测试标题' });
      expect(result).toContainEqual({ property: 'og:description', content: '测试描述' });
    });

    it('应生成正确的 Open Graph 标签', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
        siteUrl: 'https://example.com',
        path: '/article/test',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ property: 'og:url', content: 'https://example.com/article/test' });
      expect(result).toContainEqual({ property: 'og:locale', content: 'zh_CN' });
      expect(result).toContainEqual({ property: 'og:site_name', content: 'PixelVerse' });
    });

    it('应生成正确的 Twitter Card 标签', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' });
      expect(result).toContainEqual({ name: 'twitter:title', content: '测试标题' });
      expect(result).toContainEqual({ name: 'twitter:description', content: '测试描述' });
    });

    it('应正确处理相对路径图片', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
        siteUrl: 'https://example.com',
        image: '/images/test.png',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ property: 'og:image', content: 'https://example.com/images/test.png' });
      expect(result).toContainEqual({ name: 'twitter:image', content: 'https://example.com/images/test.png' });
    });

    it('应正确处理绝对路径图片', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
        image: 'https://cdn.example.com/image.png',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ property: 'og:image', content: 'https://cdn.example.com/image.png' });
    });

    it('应为文章类型添加额外信息', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        type: 'article',
        publishedTime: '2024-03-15',
        modifiedTime: '2024-03-20',
        author: '作者名',
        tags: ['技术', 'React'],
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ property: 'article:published_time', content: '2024-03-15' });
      expect(result).toContainEqual({ property: 'article:modified_time', content: '2024-03-20' });
      expect(result).toContainEqual({ property: 'article:author', content: '作者名' });
      expect(result).toContainEqual({ property: 'article:tag', content: '技术' });
      expect(result).toContainEqual({ property: 'article:tag', content: 'React' });
    });

    it('应使用默认值处理缺失配置', () => {
      const config = {
        title: '测试标题',
        description: '测试描述',
      };
      const result = generateMetaTags(config);

      expect(result).toContainEqual({ name: 'author', content: 'PixelVerse' });
      expect(result).toContainEqual({ property: 'og:type', content: 'website' });
    });
  });

  describe('generateJsonLD', () => {
    it('应生成正确的 Article JSON-LD', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        path: '/article/test',
      };
      const result = generateJsonLD(config);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('测试文章');
      expect(result.description).toBe('测试描述');
    });

    it('应包含作者信息', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        author: '作者名',
      };
      const result = generateJsonLD(config);

      expect(result.author['@type']).toBe('Person');
      expect(result.author.name).toBe('作者名');
    });

    it('应包含发布者信息', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
      };
      const result = generateJsonLD(config);

      expect(result.publisher['@type']).toBe('Organization');
      expect(result.publisher.name).toBe('PixelVerse');
    });

    it('应包含日期信息', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        publishedTime: '2024-03-15',
        modifiedTime: '2024-03-20',
      };
      const result = generateJsonLD(config);

      expect(result.datePublished).toBe('2024-03-15');
      expect(result.dateModified).toBe('2024-03-20');
    });

    it('应包含图片信息', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        image: '/images/test.png',
      };
      const result = generateJsonLD(config);

      expect(result.image['@type']).toBe('ImageObject');
    });

    it('应包含文章正文', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        articleBody: '这是文章的完整内容...',
      };
      const result = generateJsonLD(config);

      expect(result.articleBody).toBe('这是文章的完整内容...');
    });

    it('应包含 mainEntityOfPage', () => {
      const config = {
        title: '测试文章',
        description: '测试描述',
        path: '/article/test',
      };
      const result = generateJsonLD(config);

      expect(result.mainEntityOfPage['@type']).toBe('WebPage');
    });
  });

  describe('generateWebsiteJsonLD', () => {
    it('应生成正确的 Website JSON-LD', () => {
      const result = generateWebsiteJsonLD();

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe('PixelVerse');
    });

    it('应包含站点描述', () => {
      const result = generateWebsiteJsonLD();

      expect(result.description).toBe('内容即体验的个人博客系统');
    });

    it('应包含搜索操作', () => {
      const result = generateWebsiteJsonLD();

      expect(result.potentialAction['@type']).toBe('SearchAction');
      expect(result.potentialAction['query-input']).toContain('search_term_string');
    });

    it('应支持自定义站点 URL', () => {
      const result = generateWebsiteJsonLD('https://example.com');

      expect(result.url).toBe('https://example.com');
      expect(result.potentialAction.target).toContain('https://example.com');
    });
  });

  describe('generateBreadcrumbJsonLD', () => {
    it('应生成正确的 BreadcrumbList JSON-LD', () => {
      const items = [
        { name: '首页', path: '/' },
        { name: '博客', path: '/blog' },
        { name: '文章', path: '/blog/article' },
      ];
      const result = generateBreadcrumbJsonLD(items);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
    });

    it('应正确设置位置索引', () => {
      const items = [
        { name: '首页', path: '/' },
        { name: '博客', path: '/blog' },
      ];
      const result = generateBreadcrumbJsonLD(items);

      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[1].position).toBe(2);
    });

    it('应正确生成每个面包屑项', () => {
      const items = [
        { name: '首页', path: '/' },
        { name: '博客', path: '/blog' },
      ];
      const result = generateBreadcrumbJsonLD(items);

      expect(result.itemListElement[0]['@type']).toBe('ListItem');
      expect(result.itemListElement[0].name).toBe('首页');
      expect(result.itemListElement[0].item).toBe('https://pixelverse.blog/');
    });

    it('应支持自定义站点 URL', () => {
      const items = [{ name: '首页', path: '/' }];
      const result = generateBreadcrumbJsonLD(items, 'https://example.com');

      expect(result.itemListElement[0].item).toBe('https://example.com/');
    });

    it('应正确处理空列表', () => {
      const result = generateBreadcrumbJsonLD([]);

      expect(result.itemListElement).toHaveLength(0);
    });
  });
});