/**
 * SEO 元信息生成工具
 * @module utils/seo
 */

/**
 * SEO 元信息配置
 */
interface SEOConfig {
  title: string;
  description: string;
  /** 站点 URL */
  siteUrl?: string;
  /** 文章路径 */
  path?: string;
  /** 封面图 */
  image?: string;
  /** 文章类型 */
  type?: 'website' | 'article';
  /** 发布日期 */
  publishedTime?: string;
  /** 更新日期 */
  modifiedTime?: string;
  /** 作者 */
  author?: string;
  /** 标签 */
  tags?: string[];
}

/**
 * 生成页面标题
 * @param title - 页面标题
 * @param siteName - 站点名称
 * @returns 完整的页面标题
 */
export function generatePageTitle(title: string, siteName: string = 'PixelVerse'): string {
  if (!title) return siteName;
  return `${title} | ${siteName}`;
}

/**
 * 生成 SEO meta 标签
 * @param config - SEO 配置
 * @returns meta 标签对象数组
 */
export function generateMetaTags(config: SEOConfig): Record<string, string>[] {
  const {
    title,
    description,
    siteUrl = 'https://pixelverse.blog',
    path = '',
    image = '/images/og/default.png',
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'PixelVerse',
    tags,
  } = config;

  const url = `${siteUrl}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const metaTags: Record<string, string>[] = [
    // 基础 meta
    { name: 'description', content: description },
    { name: 'author', content: author },

    // Open Graph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:site_name', content: 'PixelVerse' },
    { property: 'og:locale', content: 'zh_CN' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];

  // 文章类型额外信息
  if (type === 'article') {
    if (publishedTime) {
      metaTags.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    }
    if (author) {
      metaTags.push({ property: 'article:author', content: author });
    }
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        metaTags.push({ property: 'article:tag', content: tag });
      });
    }
  }

  return metaTags;
}

/**
 * 生成 JSON-LD 结构化数据
 * @param config - SEO 配置
 * @returns JSON-LD 对象
 */
export function generateJsonLD(config: SEOConfig & { articleBody?: string }) {
  const {
    title,
    description,
    siteUrl = 'https://pixelverse.blog',
    path = '',
    image,
    publishedTime,
    modifiedTime,
    author = 'PixelVerse',
    articleBody,
  } = config;

  const url = `${siteUrl}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    author: {
      '@type': 'Person',
      name: author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PixelVerse',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image.startsWith('http') ? image : `${siteUrl}${image}`,
      },
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(articleBody && { articleBody }),
  };
}

/**
 * 生成网站 JSON-LD 结构化数据
 * @param siteUrl - 站点 URL
 * @returns JSON-LD 对象
 */
export function generateWebsiteJsonLD(siteUrl: string = 'https://pixelverse.blog') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PixelVerse',
    url: siteUrl,
    description: '内容即体验的个人博客系统',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 生成网站 JSON-LD（对象参数版本，供 JsonLD.astro 使用）
 */
export function generateWebsiteJsonLDFromConfig(config: {
  name: string;
  description: string;
  url: string;
  logo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    description: config.description,
    ...(config.logo && {
      image: {
        '@type': 'ImageObject',
        url: config.logo,
      },
    }),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${config.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 生成文章 JSON-LD（对象参数版本，供 JsonLD.astro 使用）
 */
export function generateArticleJsonLD(config: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; url?: string };
  image?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.headline,
    description: config.description,
    url: config.url,
    author: {
      '@type': 'Person',
      name: config.author.name,
      ...(config.author.url && { url: config.author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'PixelVerse',
      url: config.url,
      logo: {
        '@type': 'ImageObject',
        url: `${config.url}/images/logo.png`,
      },
    },
    ...(config.image && {
      image: {
        '@type': 'ImageObject',
        url: config.image.startsWith('http') ? config.image : `${config.url}${config.image}`,
      },
    }),
    datePublished: config.datePublished,
    ...(config.dateModified && { dateModified: config.dateModified }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url,
    },
    ...(config.keywords && config.keywords.length > 0 && { keywords: config.keywords.join(', ') }),
  };
}

/**
 * 生成面包屑 JSON-LD（对象参数版本，供 JsonLD.astro 使用）
 */
export function generateBreadcrumbJsonLDFromConfig(config: {
  items: Array<{ name: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: config.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 生成面包屑 JSON-LD 结构化数据
 * @param items - 面包屑项
 * @param siteUrl - 站点 URL
 * @returns JSON-LD 对象
 */
export function generateBreadcrumbJsonLD(
  items: Array<{ name: string; path: string }>,
  siteUrl: string = 'https://pixelverse.blog'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}